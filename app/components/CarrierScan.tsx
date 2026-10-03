"use client";

import { useEffect, useRef, useState } from "react";
import type { CarrierCategory, CarrierContext } from "@/app/lib/carrier";
import type { CarrierIntent } from "@/app/lib/carrier-contract";
import { buildCarrierContext, questionsForCarrier, type CarrierAnswer } from "@/app/lib/carrier-scan";

export function CarrierScan({ intent, category, carrierId, onBack, onComplete }: { intent: CarrierIntent; category: CarrierCategory; carrierId: string; onBack: () => void; onComplete: (context: CarrierContext) => void }) {
  const questions = questionsForCarrier(category);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<CarrierAnswer[]>([]);
  const [selected, setSelected] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);
  const question = questions[index];
  const journeyLabel = intent === "requirement" ? "Device request" : intent === "discounts" ? "Possible savings" : "Protection recommendation";

  useEffect(() => { headingRef.current?.focus({ preventScroll: true }); }, [index]);
  useEffect(() => { try { localStorage.setItem("smartdevices-carrier-scan-v1", JSON.stringify({ schemaVersion: 1, intent, category, answers })); } catch {} }, [answers, category, intent]);

  function next(optionId = selected) {
    if (!optionId) return;
    const nextAnswers = [...answers.filter((answer) => answer.questionId !== question.id), { questionId: question.id, optionId }];
    setAnswers(nextAnswers);
    setSelected("");
    if (index >= questions.length - 1) onComplete(buildCarrierContext(intent, category, nextAnswers, carrierId));
    else setIndex((value) => value + 1);
  }
  function back() {
    if (index === 0) { onBack(); return; }
    const prior = questions[index - 1];
    setIndex((value) => value - 1);
    setSelected(answers.find((answer) => answer.questionId === prior.id)?.optionId ?? "");
  }

  return <section className="carrier-scan" aria-labelledby="carrier-question-heading">
    <div className="carrier-scan-progress" aria-live="polite"><span>Question {index + 1} of {questions.length}</span><progress value={index + 1} max={questions.length}>{index + 1}/{questions.length}</progress></div>
    <p className="eyebrow">{journeyLabel}</p>
    <h2 id="carrier-question-heading" ref={headingRef} tabIndex={-1}>{question.prompt}</h2>
    <fieldset className="carrier-scan-options"><legend className="sr-only">{question.prompt}</legend>{question.options.map((option) => <label key={option.id} className={selected === option.id ? "is-selected" : ""}><input type="radio" name={question.id} value={option.id} checked={selected === option.id} onChange={() => setSelected(option.id)} /><span>{option.label}</span></label>)}</fieldset>
    <div className="carrier-scan-actions"><button className="button-subtle" type="button" onClick={back}>Back</button><div>{!question.required ? <button className="button-subtle" type="button" onClick={() => next("skip")}>Skip</button> : null}<button className="button-primary" type="button" disabled={!selected} onClick={() => next()}>Continue</button></div></div>
    <details className="why-ask"><summary>Why we ask</summary><p>{question.why}</p></details>
    <p className="form-note">No address, policy number or contact information is collected.</p>
  </section>;
}
