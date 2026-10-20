import type { StatusTone } from "../utils/labels.ts";

interface StatusBadgeProps {
  label: string;
  tone: StatusTone;
}

const StatusBadge = ({ label, tone }: StatusBadgeProps) => (
  <span className={`status-badge status-badge-${tone}`}>{label}</span>
);

export default StatusBadge;
