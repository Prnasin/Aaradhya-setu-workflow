import { STEPS } from "@/lib/workflow";

// Coloured pill for a workflow step (colour comes from the step number in CSS)
export default function StatusBadge({ status }) {
  return <span className={`badge step-${STEPS.indexOf(status)}`}>{status}</span>;
}
