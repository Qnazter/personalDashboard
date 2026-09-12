import type { HTMLAttributes } from "react";

type ProgressProps = HTMLAttributes<HTMLDivElement> & { value?: number };

export function Progress({ value, className = "", ...props }: ProgressProps) {
  const indeterminate = value === undefined;
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={indeterminate ? undefined : value}
      className={`h-2 w-full overflow-hidden rounded-full bg-panel2 ${className}`}
      {...props}
    >
      <div
        className={indeterminate ? "h-full w-2/5 rounded-full bg-accent2 animate-progress" : "h-full rounded-full bg-accent2 transition-all duration-500"}
        style={indeterminate ? undefined : { width: `${Math.max(0, Math.min(100, value ?? 0))}%` }}
      />
    </div>
  );
}
