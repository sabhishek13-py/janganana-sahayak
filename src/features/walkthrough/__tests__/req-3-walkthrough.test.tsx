import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CENSUS_2027 } from '@/data/census2027';
import { PHASE_1_QUESTIONS } from '@/data/phase1-questions';
import { hloQuestionSchema } from '@/data/schema';
import { ASK_ANSWER, ASK_NOT_NOTIFIED, jsonResponse } from '@/test/__fixtures__/model-replies';
import { renderWithIntl } from '@/test/render-with-intl';

import { AskAssistant } from '../components/ask-assistant';
import { PracticeForm } from '../components/practice-form';
import { DOCUMENT_CHECKLIST } from '../lib/checklist';

describe('REQ-3 houselisting question set', () => {
  it('holds exactly the notified number of questions, numbered 1..n', () => {
    expect(PHASE_1_QUESTIONS).toHaveLength(CENSUS_2027.houselisting.questionCount);
    PHASE_1_QUESTIONS.forEach((question, index) => {
      expect(question.number).toBe(index + 1);
      expect(() => hloQuestionSchema.parse(question)).not.toThrow();
    });
  });

  it('gives every choice question a non-empty option list', () => {
    for (const question of PHASE_1_QUESTIONS) {
      if (question.kind === 'SINGLE_CHOICE' || question.kind === 'MULTI_CHOICE') {
        expect(question.options.length).toBeGreaterThan(1);
      }
    }
  });

  it('warns the reader not to type a real name', () => {
    const nameQuestion = PHASE_1_QUESTIONS.find((q) => q.prompt.includes('head of the household'));
    expect(nameQuestion?.help).toMatch(/do not type a real name/i);
  });

  it('tells the reader no document is demanded as proof', () => {
    expect(DOCUMENT_CHECKLIST.at(-1)?.label).toMatch(/no Aadhaar, no bank details/i);
  });
});

describe('REQ-3 practice mode persists nothing', () => {
  let setItem: ReturnType<typeof vi.spyOn>;
  let sessionSetItem: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    setItem = vi.spyOn(window.localStorage, 'setItem');
    sessionSetItem = vi.spyOn(window.sessionStorage, 'setItem');
  });

  afterEach(() => {
    setItem.mockRestore();
    sessionSetItem.mockRestore();
  });

  it('never writes an answer to browser storage or the network', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');
    renderWithIntl(<PracticeForm />);

    await user.type(screen.getByLabelText(/Building number/), '12A');
    expect(screen.getByLabelText(/Building number/)).toHaveValue('12A');

    expect(setItem).not.toHaveBeenCalled();
    expect(sessionSetItem).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(document.cookie).toBe('');
  });

  it('drops every answer when the page is left', async () => {
    const user = userEvent.setup();
    const first = renderWithIntl(<PracticeForm />);
    await user.type(screen.getByLabelText(/Building number/), '12A');
    first.unmount();

    renderWithIntl(<PracticeForm />);
    expect(screen.getByLabelText(/Building number/)).toHaveValue('');
  });

  it('clears answers on request and says so', async () => {
    const user = userEvent.setup();
    renderWithIntl(<PracticeForm />);
    await user.type(screen.getByLabelText(/Building number/), '12A');
    expect(screen.getByText('Progress: 1 / 33')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Clear my practice answers' }));
    expect(screen.getByLabelText(/Building number/)).toHaveValue('');
    expect(screen.getByText('Practice answers cleared')).toBeInTheDocument();
  });
});

describe('REQ-3 grounded assistant', () => {
  it('shows a grounded answer with its sources', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(ASK_ANSWER));
    renderWithIntl(<AskAssistant />);

    await user.type(screen.getByLabelText('Ask about the census'), 'When does it open?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    await waitFor(() => {
      expect(screen.getByText(ASK_ANSWER.answer)).toBeInTheDocument();
    });
    expect(screen.getByText(/Source:/)).toBeInTheDocument();
  });

  it('reports "not yet notified" rather than inventing an answer', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(ASK_NOT_NOTIFIED));
    renderWithIntl(<AskAssistant />);

    await user.type(
      screen.getByLabelText('Ask about the census'),
      'What are the Phase II questions?',
    );
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    await waitFor(() => {
      expect(screen.getByText(ASK_NOT_NOTIFIED.answer)).toBeInTheDocument();
    });
  });

  it('falls back to an error message when the response fails validation', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse({ answer: 42 }));
    renderWithIntl(<AskAssistant />);

    await user.type(screen.getByLabelText('Ask about the census'), 'Anything at all?');
    await user.click(screen.getByRole('button', { name: 'Ask' }));

    await waitFor(() => {
      expect(screen.getByText('Something went wrong.')).toBeInTheDocument();
    });
  });
});
