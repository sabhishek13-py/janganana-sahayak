'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface PracticeAnswers {
  readonly answers: ReadonlyMap<number, string>;
  readonly setAnswer: (questionNumber: number, value: string) => void;
  readonly clear: () => void;
  readonly answeredCount: number;
}

/**
 * @requirement REQ-3 Guide users through self-enumeration
 * Practice answers live in React state and nowhere else. Nothing is written to
 * localStorage, sessionStorage, cookies, IndexedDB or the network, and the ref
 * is emptied on unmount so nothing lingers in a retained closure.
 */
export function usePracticeAnswers(): PracticeAnswers {
  const [answers, setAnswers] = useState<ReadonlyMap<number, string>>(() => new Map());
  const latest = useRef(answers);
  latest.current = answers;

  useEffect(() => {
    const store = latest;
    return () => {
      store.current = new Map();
    };
  }, []);

  const setAnswer = useCallback((questionNumber: number, value: string) => {
    setAnswers((previous) => {
      const next = new Map(previous);
      if (value === '') next.delete(questionNumber);
      else next.set(questionNumber, value);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setAnswers(new Map());
  }, []);

  return { answers, setAnswer, clear, answeredCount: answers.size };
}
