'use client';

import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { MediaAsset } from '@/types/heritage';
import { formatHistoricalDate } from '@/lib/format';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';

interface LightboxProps {
  readonly assets: readonly MediaAsset[];
  readonly index: number;
  readonly onClose: () => void;
  readonly onNavigate: (index: number) => void;
}

/**
 * Fullscreen viewer.
 *
 * Mobile affordances are the point here: horizontal swipe moves between
 * images, a downward swipe dismisses, and the image tracks the finger while
 * dragging so the gesture feels connected rather than triggered. Focus is
 * trapped and restored, and arrow keys work for desktop.
 */
export function Lightbox({
  assets,
  index,
  onClose,
  onNavigate,
}: LightboxProps): React.ReactElement | null {
  const asset = assets[index];
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const touchRef = useRef<{ x: number; y: number; axis: 'none' | 'x' | 'y' } | null>(null);

  const go = useCallback(
    (delta: number) => {
      const next = index + delta;
      if (next < 0 || next >= assets.length) return;
      onNavigate(next);
    },
    [index, assets.length, onNavigate],
  );

  // Focus management: remember what was focused, move focus in, restore on close.
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    return () => restoreFocusRef.current?.focus?.();
  }, []);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'Tab') {
        // Simple trap: the dialog holds few controls, so cycling within it
        // is enough and avoids a full tabbable-node scan.
        const focusables = dialogRef.current?.querySelectorAll<HTMLElement>('button');
        if (!focusables || focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go, onClose]);

  const onTouchStart = (e: React.TouchEvent): void => {
    const touch = e.touches[0];
    if (!touch) return;
    touchRef.current = { x: touch.clientX, y: touch.clientY, axis: 'none' };
  };

  const onTouchMove = (e: React.TouchEvent): void => {
    const state = touchRef.current;
    const touch = e.touches[0];
    if (!state || !touch) return;
    const dx = touch.clientX - state.x;
    const dy = touch.clientY - state.y;

    // Lock the axis once intent is clear, so a swipe does not do both.
    if (state.axis === 'none') {
      if (Math.abs(dx) > 12 || Math.abs(dy) > 12) {
        state.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y';
      } else {
        return;
      }
    }

    setDrag(state.axis === 'x' ? { dx, dy: 0 } : { dx: 0, dy: Math.max(0, dy) });
  };

  const onTouchEnd = (): void => {
    const state = touchRef.current;
    const current = drag;
    touchRef.current = null;
    setDrag(null);
    if (!state || !current) return;

    if (state.axis === 'x' && Math.abs(current.dx) > 70) {
      go(current.dx < 0 ? 1 : -1);
    } else if (state.axis === 'y' && current.dy > 110) {
      onClose();
    }
  };

  if (!asset) return null;

  const dragStyle = drag
    ? {
        transform: `translate3d(${drag.dx}px, ${drag.dy}px, 0)`,
        opacity: drag.dy > 0 ? Math.max(0.35, 1 - drag.dy / 380) : 1,
        transition: 'none',
      }
    : { transform: 'translate3d(0,0,0)', transition: 'transform 320ms cubic-bezier(0.16,1,0.3,1)' };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`${asset.alt}. Image ${index + 1} of ${assets.length}.`}
      tabIndex={-1}
      className="fixed inset-0 z-[80] flex flex-col bg-background/97 outline-none backdrop-blur-xl"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-center justify-between px-4 pt-safe">
        <span className="py-4 font-sans text-xs tabular-nums tracking-wide text-muted-foreground">
          {index + 1} / {assets.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="touch-target -mr-2 flex items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
          aria-label="Close viewer"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-3 sm:px-16">
        <div className="relative h-full w-full" style={dragStyle}>
          <Image
            src={asset.src}
            alt={asset.alt}
            fill
            sizes="100vw"
            priority
            className="rounded-xl object-contain"
            placeholder={asset.blurDataURL ? 'blur' : 'empty'}
            blurDataURL={asset.blurDataURL}
          />
        </div>

        {/* Desktop arrows; on touch the swipe handles this. */}
        <button
          type="button"
          onClick={() => go(-1)}
          disabled={index === 0}
          className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/15 bg-white/[0.065] text-muted-foreground backdrop-blur-md transition-colors hover:border-gold/40 hover:text-gold-100 disabled:pointer-events-none disabled:opacity-25 sm:flex"
          aria-label="Previous image"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          disabled={index === assets.length - 1}
          className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/15 bg-white/[0.065] text-muted-foreground backdrop-blur-md transition-colors hover:border-gold/40 hover:text-gold-100 disabled:pointer-events-none disabled:opacity-25 sm:flex"
          aria-label="Next image"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>

      <div className="px-5 pb-safe">
        <div className="mx-auto max-w-2xl py-5 text-center">
          {asset.caption && (
            <p className="font-serif text-fluid-sm leading-relaxed text-foreground/90">
              {asset.caption}
            </p>
          )}
          <p className="mt-2 font-sans text-[0.6875rem] tracking-[0.12em] text-gold-200/70">
            {asset.date ? formatHistoricalDate(asset.date).toUpperCase() : 'DATE UNKNOWN'}
            {asset.collection ? ` · ${asset.collection.toUpperCase()}` : ''}
          </p>
          <p className="mt-3 font-sans text-[0.625rem] text-muted-foreground/50 sm:hidden">
            Swipe to browse · swipe down to close
          </p>
        </div>
      </div>
    </div>
  );
}
