import { cloneElement } from 'react';

import { Link } from '@bedrockio/router';
import { ArrowLeft, CircleX } from 'lucide-react';

import Meta from 'components/Meta';

import { Button } from '@/components/ui/button';

export default function NotFound({ message, link }) {
  const cta = link ? (
    cloneElement(link, undefined, (
      <>
        <ArrowLeft />
        {link.props.children}
      </>
    ))
  ) : (
    <Link to="/">
      <ArrowLeft />
      Dashboard
    </Link>
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
      <Meta title="Not Found" />
      <div className="bg-primary/10 text-primary grid size-16 place-items-center rounded-2xl">
        <CircleX className="size-8" strokeWidth={1.75} />
      </div>
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-balance">
          {message || 'Sorry, that page was not found.'}
        </h1>
        <p className="text-muted-foreground max-w-sm text-sm text-balance">
          The page you're looking for doesn't exist or may have been moved.
        </p>
      </div>
      <Button asChild>{cta}</Button>
    </div>
  );
}
