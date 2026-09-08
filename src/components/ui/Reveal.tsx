'use client';

import { useEffect, useRef, useState } from 'react';

interface RevealProps {
  readonly children: React.ReactNode;
  readonly className?: string;
  /** Stagger in ms, for sequences. */
  readonly delay?: number;
  readonly as?: 'div' | 'li' | 'article' | 'section';
}

/**
 * Reveal-on-scroll via IntersectionObserver.
 *
 * Content is visible by default and only hidden once the observer confirms it
 * can run, so the page is never left blank if JS fails or is still loading.
 * Reduced-motion users skip the animation entirely.
 */
export function Reveal({
  children,
  className = '',
  delay = 0,
  as: Tag = 'div',
}: RevealProps): React.ReactElement {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced || typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    setArmed(true);
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const hidden = armed && !shown;

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement & HTMLLIElement>}
      className={`${className} ${
        hidden ? 'translate-y-3 opacity-0' : 'translate-y-0 opacity-100'
      } transition-[opacity,transform] [transition-duration:900ms] ease-heritage motion-reduce:transition-none`}
      style={hidden ? undefined : { transitionDelay: `${delay}ms` }}
    >
      {children}
    </Tag>
  );
}
