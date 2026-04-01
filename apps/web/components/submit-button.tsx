"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleLabel: string;
  pendingLabel: string;
  tone?: "default" | "strong" | "ghost";
};

export function SubmitButton({
  idleLabel,
  pendingLabel,
  tone = "default"
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button className={`action-button ${tone}`} disabled={pending} type="submit">
      {pending ? pendingLabel : idleLabel}
    </button>
  );
}
