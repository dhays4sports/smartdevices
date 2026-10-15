"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { buildScanResult, questionsFor, type ScanAnswer, type ScanResult } from "@/app/lib/scan";
import type { Device, DomainId } from "@/app/lib/data";

type Props = {
  domainId: DomainId;
  concernId: string;
  onBack: () => void;
  onComplete: (result: ScanResult, answers: ScanAnswer[]) => void;
  publishedDevices: Device[];
};

const DRAFT_KEY = "smartdevices-scan-draft-v1";

export function IntelligentScan({ domainId, concernId, onBack, onComplete, publishedDevices }: Props) {
  const questions = useMemo(() => questionsFor(domainId, concernId), [domainId, concernId]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<ScanAnswer[]>([]);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const question = questions[index];
  const selected = question ? answers.find((answer) => answer.questionId === question.id)?.optionId : undefined;

  useEffect(() => {
    headingRef.current?.focus();
  }, [index]);

  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ schemaVersion: 1, domainId, concernId, index, answers }));
    } catch {
      // This non-authoritative local convenience never changes the scan result contract.
    }
  }, [answers, concernId, domainId, index]);

  function choose(optionId: string) {
    setAnswers((current) => [...current.filter((answer) => answer.questionId !== question.id), { questionId: question.id, optionId }]);
  }

  function advance(optionId = selected) {
    if (!optionId || !question) return;
    const nextAnswers = [...answers.filter((answer) => answer.questionId !== question.id), { questionId: question.id, optionId }];
    if (index === questions.length - 1) {
      onComplete(buildScanResult(domainId, concernId, nextAnswers, publishedDevices), nextAnswers);
      return;
    }
    setAnswers(nextAnswers);
    setIndex((current) => current + 1);
  }

  function skip() {
    if (!question.allowSkip) return;
    advance("skipped");
  }

  function goBack() {
    if (index === 0) onBack();
    else setIndex((current) => current - 1);
  }

  if (!question) return <p className="empty-state">No governed scan path is published for this guide.</p>;

  return (
    <section className="scan-shell" aria-labelledby="scan-question">
      <div className="scan-meta">
        <p className="eyebrow">Intelligent Scan</p>
        <span aria-live="polite">Question {index + 1} of {questions.length}</span>
      </div>
      <div className="scan-progress" aria-hidden="true"><span style={{ width: `${((index + 1) / questions.length) * 100}%` }} /></div>
      <h2 id="scan-question" ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
      <details className="why-ask"><summary>Why we ask</summary><p>{question.why}</p></details>
      <fieldset className="scan-options">
        <legend className="sr-only">Choose one answer</legend>
        {question.options.map((option) => (
          <label key={option.id} className={selected === option.id ? "scan-option is-selected" : "scan-option"}>
            <input type="radio" name={question.id} value={option.id} checked={selected === option.id} onChange={() => choose(option.id)} />
            <span><strong>{option.label}</strong>{option.id === "unknown" ? <small>We’ll keep this visibly unknown.</small> : null}</span>
          </label>
        ))}
      </fieldset>
      <div className="scan-actions">
        <button className="button-subtle" type="button" onClick={goBack}>Back</button>
        <div>{question.allowSkip ? <button className="button-subtle" type="button" onClick={skip}>Skip</button> : null}<button className="button-primary" type="button" disabled={!selected} onClick={() => advance()}>{index === questions.length - 1 ? "See my protection map" : "Continue"}</button></div>
      </div>
      <p className="scan-storage-note">Your answers stay on this device as a non-authoritative draft unless you later choose a consented save or share action.</p>
    </section>
  );
}
