import { cn } from '@/lib/utils';

/**
 * Two-column key/value table for detail/overview screens (§5.5) — highly
 * legible. Usage:
 *   <DefinitionList>
 *     <DefinitionItem label="Created At">{date}</DefinitionItem>
 *   </DefinitionList>
 */
function DefinitionList({ className, ...props }) {
  return (
    <dl
      data-slot="definition-list"
      className={cn(
        'card-soft divide-border divide-y rounded-2xl text-sm',
        className,
      )}
      {...props}
    />
  );
}

function DefinitionItem({ label, children, className }) {
  return (
    <div
      className={cn('grid grid-cols-[180px_1fr] gap-4 px-6 py-3.5', className)}>
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="text-foreground min-w-0">{children}</dd>
    </div>
  );
}

export { DefinitionList, DefinitionItem };
