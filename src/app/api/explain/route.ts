import { PHASE_1_QUESTIONS } from '@/data/phase1-questions';
import { LOCALE_LABELS } from '@/i18n/routing';
import { explainRequestSchema } from '@/lib/ai/contracts';
import { generateTextStream } from '@/lib/ai/generate';
import { BASE_SYSTEM_INSTRUCTION } from '@/lib/ai/prompt-guard';
import { guardRequest, mapAiRouteError } from '@/lib/api/handler';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SYSTEM = [
  BASE_SYSTEM_INSTRUCTION,
  'Explain one houselisting question the way you would to a ten-year-old.',
  'Two or three short sentences. Give one everyday example. No jargon, no lists, no markdown.',
].join(' ');

/**
 * @requirement REQ-3 Guide users through self-enumeration
 * Streams a plain-language explanation. The question is chosen by number from
 * the frozen dataset, so no visitor text ever reaches this prompt.
 */
export async function POST(request: Request): Promise<Response> {
  const guarded = await guardRequest(request, explainRequestSchema);
  if (!guarded.ok) return guarded.response;

  const question = PHASE_1_QUESTIONS.find((item) => item.number === guarded.body.questionNumber);
  if (question === undefined) {
    return Response.json(
      { error: 'Unknown question number.' },
      { status: 404, headers: { 'cache-control': 'no-store' } },
    );
  }

  try {
    const chunks = generateTextStream({
      prompt: [
        `Question ${String(question.number)}: ${question.prompt}`,
        `Official help text: ${question.help}`,
        `Write the explanation in ${LOCALE_LABELS[guarded.body.locale]}.`,
      ].join('\n'),
      systemInstruction: SYSTEM,
    });

    // An async generator runs no code until it is first pulled, so calling
    // `generateTextStream` above cannot throw. Pull the first chunk here, while
    // the status line can still be changed: that is what turns a missing Gemini
    // key into a 503 instead of a 200 carrying a stream that errors mid-flight.
    const first = await chunks.next();

    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          if (first.done !== true) controller.enqueue(encoder.encode(first.value));
          for await (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        'content-type': 'text/plain; charset=utf-8',
        'cache-control': 'no-store',
        'x-content-type-options': 'nosniff',
      },
    });
  } catch (error) {
    return mapAiRouteError(error);
  }
}
