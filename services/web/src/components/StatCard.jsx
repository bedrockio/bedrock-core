import { cn } from '@/lib/utils';

/**
 * Operator's Console stat card — a borderless card that floats on the shared
 * Highlight + Shadow depth, an uppercase micro-label, a big tabular-mono value,
 * and an optional context hint. Numbers lead; chrome recedes.
 */
export function StatCard({ label, value, hint, icon: Icon, className }) {
  return (
    <div className={cn('card-soft rounded-2xl p-4', className)}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
          {label}
        </span>
        {Icon && <Icon className="text-muted-foreground size-4 shrink-0" />}
      </div>
      <div className="mt-2 font-mono text-2xl font-bold tracking-tight tabular-nums">
        {value}
      </div>
      {hint && (
        <div className="text-muted-foreground mt-1 text-xs font-medium tabular-nums">
          {hint}
        </div>
      )}
    </div>
  );
}

/** Responsive auto-fit grid for a row of StatCards. */
export function StatGrid({ children, className }) {
  return (
    <div
      className={cn('grid gap-4', className)}
      style={{
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
      }}>
      {children}
    </div>
  );
}
