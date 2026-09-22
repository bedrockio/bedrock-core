import { ChevronLeft, ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

const DOTS = 'dots';

function range(start, end) {
  const out = [];
  for (let i = start; i <= end; i++) out.push(i);
  return out;
}

/**
 * Page range with leading/trailing boundaries and siblings around the current
 * page, collapsing gaps into ellipses — mirrors Mantine's Pagination behaviour.
 */
function getPaginationRange(page, total, siblings = 2, boundaries = 2) {
  const totalNumbers = siblings * 2 + 3 + boundaries * 2;
  if (totalNumbers >= total) {
    return range(1, total);
  }

  const leftSibling = Math.max(page - siblings, boundaries + 2);
  const rightSibling = Math.min(page + siblings, total - boundaries - 1);

  const showLeftDots = leftSibling > boundaries + 2;
  const showRightDots = rightSibling < total - boundaries - 1;

  const head = range(1, boundaries);
  const tail = range(total - boundaries + 1, total);

  if (!showLeftDots && showRightDots) {
    const left = range(1, siblings * 2 + boundaries + 2);
    return [...left, DOTS, ...tail];
  }
  if (showLeftDots && !showRightDots) {
    const right = range(total - (siblings * 2 + boundaries + 1), total);
    return [...head, DOTS, ...right];
  }
  return [
    ...head,
    DOTS,
    ...range(leftSibling, rightSibling),
    DOTS,
    ...tail,
  ];
}

const itemClass =
  'inline-flex h-9 min-w-9 cursor-pointer appearance-none items-center justify-center rounded-md border-0 bg-transparent px-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground disabled:pointer-events-none disabled:opacity-50';

/**
 * Controlled pagination. `page` is 1-based; `total` is the number of pages.
 */
export function Pagination({ page, total, onChange, disabled, className }) {
  if (!total || total <= 1) {
    return null;
  }
  const pages = getPaginationRange(page, total);

  return (
    <nav
      aria-label="pagination"
      className={cn('flex items-center gap-1', className)}>
      <button
        type="button"
        aria-label="Previous page"
        className={itemClass}
        disabled={disabled || page <= 1}
        onClick={() => onChange(page - 1)}>
        <ChevronLeft className="size-4" />
      </button>
      {pages.map((p, i) =>
        p === DOTS ? (
          <span
            key={`dots-${i}`}
            className="text-muted-foreground inline-flex h-9 min-w-9 items-center justify-center px-1">
            &hellip;
          </span>
        ) : (
          <button
            key={p}
            type="button"
            aria-current={p === page ? 'page' : undefined}
            disabled={disabled}
            onClick={() => onChange(p)}
            className={cn(
              itemClass,
              p === page &&
                'bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground',
            )}>
            {p}
          </button>
        ),
      )}
      <button
        type="button"
        aria-label="Next page"
        className={itemClass}
        disabled={disabled || page >= total}
        onClick={() => onChange(page + 1)}>
        <ChevronRight className="size-4" />
      </button>
    </nav>
  );
}
