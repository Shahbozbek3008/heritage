'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ID, MediaAsset, Person } from '@/types/heritage';
import {
  buildTreeLayout,
  collectDescendantIds,
  DEFAULT_LAYOUT,
  type TreeNode,
} from '@/lib/tree-layout';
import { formatLifespan, fullName } from '@/lib/format';
import { Crosshair, Maximize2, Minus, Plus } from 'lucide-react';

interface FamilyTreeCanvasProps {
  readonly people: readonly Person[];
  readonly rootId: ID;
  readonly portraits: Readonly<Record<ID, MediaAsset | undefined>>;
}

interface Viewport {
  readonly x: number;
  readonly y: number;
  readonly scale: number;
}

const MIN_SCALE = 0.35;
const MAX_SCALE = 2.5;

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Midpoint and separation of a two-finger touch, for pinch handling. */
function pinchState(touches: TouchList): { cx: number; cy: number; dist: number } | null {
  const a = touches[0];
  const b = touches[1];
  if (!a || !b) return null;
  const dx = a.clientX - b.clientX;
  const dy = a.clientY - b.clientY;
  return {
    cx: (a.clientX + b.clientX) / 2,
    cy: (a.clientY + b.clientY) / 2,
    dist: Math.hypot(dx, dy),
  };
}

/**
 * Pan/zoom family tree.
 *
 * Rendering is a single transformed layer rather than per-node absolute
 * positioning, so panning and zooming stay on the compositor. Gestures are
 * handled manually (rather than via a library) because the interaction has to
 * coexist with page scrolling on touch: one finger pans the tree only once a
 * horizontal-ish intent is detected, otherwise the page scrolls normally.
 */
export function FamilyTreeCanvas({
  people,
  rootId,
  portraits,
}: FamilyTreeCanvasProps): React.ReactElement {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState<ReadonlySet<ID>>(() =>
    collectDescendantIds(people, rootId),
  );
  const [viewport, setViewport] = useState<Viewport>({ x: 0, y: 0, scale: 1 });
  const [selected, setSelected] = useState<ID | null>(null);
  const [ready, setReady] = useState(false);

  const layout = useMemo(
    () => buildTreeLayout(people, rootId, expanded, DEFAULT_LAYOUT),
    [people, rootId, expanded],
  );

  // --- Fit the tree to the viewport on mount and on resize ---
  const fitToView = useCallback(() => {
    const el = containerRef.current;
    if (!el || layout.width === 0) return;
    const { clientWidth, clientHeight } = el;
    const scale = clamp(
      Math.min(clientWidth / layout.width, clientHeight / layout.height) * 0.92,
      MIN_SCALE,
      1.1,
    );
    setViewport({
      x: (clientWidth - layout.width * scale) / 2,
      y: Math.max(16, (clientHeight - layout.height * scale) / 2),
      scale,
    });
    setReady(true);
  }, [layout.width, layout.height]);

  useEffect(() => {
    fitToView();
  }, [fitToView]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(() => fitToView());
    observer.observe(el);
    return () => observer.disconnect();
  }, [fitToView]);

  // --- Zoom about a screen point, keeping that point stationary ---
  const zoomAbout = useCallback((nextScale: number, cx: number, cy: number) => {
    setViewport((v) => {
      const scale = clamp(nextScale, MIN_SCALE, MAX_SCALE);
      const ratio = scale / v.scale;
      return {
        scale,
        x: cx - (cx - v.x) * ratio,
        y: cy - (cy - v.y) * ratio,
      };
    });
  }, []);

  const zoomByStep = useCallback(
    (factor: number) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setViewport((v) => {
        const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
        const ratio = scale / v.scale;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        return { scale, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio };
      });
    },
    [],
  );

  // --- Wheel: ctrl/meta zooms (trackpad pinch), plain wheel pans ---
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent): void => {
      // preventDefault requires a non-passive listener, hence manual binding.
      e.preventDefault();
      const rect = el.getBoundingClientRect();
      if (e.ctrlKey || e.metaKey) {
        const factor = Math.exp(-e.deltaY * 0.01);
        setViewport((v) => {
          const scale = clamp(v.scale * factor, MIN_SCALE, MAX_SCALE);
          const ratio = scale / v.scale;
          const cx = e.clientX - rect.left;
          const cy = e.clientY - rect.top;
          return { scale, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio };
        });
      } else {
        setViewport((v) => ({ ...v, x: v.x - e.deltaX, y: v.y - e.deltaY }));
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // --- Pointer drag (mouse / pen) ---
  const dragRef = useRef<{ id: number; startX: number; startY: number; originX: number; originY: number } | null>(
    null,
  );
  const [dragging, setDragging] = useState(false);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (e.pointerType === 'touch') return; // touch handled separately
    if (e.button !== 0) return;
    const target = e.target as HTMLElement;
    if (target.closest('a,button')) return;
    dragRef.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      originX: viewport.x,
      originY: viewport.y,
    };
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    setViewport((v) => ({
      ...v,
      x: drag.originX + (e.clientX - drag.startX),
      y: drag.originY + (e.clientY - drag.startY),
    }));
  };

  const endPointerDrag = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (dragRef.current?.id === e.pointerId) {
      dragRef.current = null;
      setDragging(false);
    }
  };

  // --- Touch: one finger pans (after intent), two fingers pinch-zoom ---
  const touchRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    startDist: number;
    startScale: number;
  }>({
    mode: 'none',
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    startDist: 0,
    startScale: 1,
  });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent): void => {
      if (e.touches.length === 2) {
        const pinch = pinchState(e.touches);
        if (!pinch) return;
        touchRef.current = {
          mode: 'pinch',
          startX: pinch.cx,
          startY: pinch.cy,
          originX: viewport.x,
          originY: viewport.y,
          startDist: pinch.dist,
          startScale: viewport.scale,
        };
      } else if (e.touches.length === 1) {
        const touch = e.touches[0];
        if (!touch) return;
        const target = e.target as HTMLElement;
        if (target.closest('a,button')) return;
        touchRef.current = {
          mode: 'pan',
          startX: touch.clientX,
          startY: touch.clientY,
          originX: viewport.x,
          originY: viewport.y,
          startDist: 0,
          startScale: viewport.scale,
        };
      }
    };

    const onTouchMove = (e: TouchEvent): void => {
      const state = touchRef.current;
      const rect = el.getBoundingClientRect();

      if (state.mode === 'pinch' && e.touches.length === 2) {
        e.preventDefault();
        const pinch = pinchState(e.touches);
        if (!pinch || state.startDist === 0) return;
        const scale = clamp(
          (state.startScale * pinch.dist) / state.startDist,
          MIN_SCALE,
          MAX_SCALE,
        );
        setViewport((v) => {
          const ratio = scale / v.scale;
          const cx = pinch.cx - rect.left;
          const cy = pinch.cy - rect.top;
          return { scale, x: cx - (cx - v.x) * ratio, y: cy - (cy - v.y) * ratio };
        });
        return;
      }

      if (state.mode === 'pan' && e.touches.length === 1) {
        const touch = e.touches[0];
        if (!touch) return;
        const dx = touch.clientX - state.startX;
        const dy = touch.clientY - state.startY;
        // Let the page scroll if the gesture is clearly vertical and small:
        // the tree only claims the gesture once movement is deliberate.
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
        e.preventDefault();
        setViewport((v) => ({ ...v, x: state.originX + dx, y: state.originY + dy }));
      }
    };

    const onTouchEnd = (): void => {
      touchRef.current.mode = 'none';
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: true });
    el.addEventListener('touchcancel', onTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [viewport.x, viewport.y, viewport.scale]);

  const toggleNode = useCallback((id: ID) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpanded(collectDescendantIds(people, rootId));
  }, [people, rootId]);

  const collapseAll = useCallback(() => {
    setExpanded(new Set([rootId]));
  }, [rootId]);

  const selectedNode = selected ? layout.nodes.find((n) => n.id === selected) : undefined;

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={`relative h-[68dvh] min-h-[420px] touch-none overflow-hidden border-y border-border/10 bg-white/[0.028] select-none md:h-[74dvh] ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endPointerDrag}
        onPointerCancel={endPointerDrag}
        role="application"
        aria-label="Interactive family tree. Drag to pan, pinch or scroll to zoom."
      >
        {/* Faint ruled ground, so panning is legible as movement. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.35]"
          style={{
            backgroundImage:
              'linear-gradient(hsl(0 0% 100% / 0.035) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100% / 0.035) 1px, transparent 1px)',
            backgroundSize: `${28 * viewport.scale}px ${28 * viewport.scale}px`,
            backgroundPosition: `${viewport.x}px ${viewport.y}px`,
          }}
        />

        <div
          className="absolute left-0 top-0 origin-top-left"
          style={{
            transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
            width: layout.width,
            height: layout.height,
            opacity: ready ? 1 : 0,
            transition: dragging ? 'none' : 'opacity 400ms ease-out',
            willChange: 'transform',
          }}
        >
          <svg
            width={layout.width}
            height={layout.height}
            className="absolute inset-0 overflow-visible"
            aria-hidden
          >
            {layout.edges.map((edge) => (
              <path
                key={edge.id}
                d={edge.path}
                fill="none"
                stroke="hsl(40 44% 58% / 0.35)"
                strokeWidth={1}
              />
            ))}
          </svg>

          {layout.nodes.map((node) => (
            <TreeNodeCard
              key={node.id}
              node={node}
              portrait={portraits[node.id]}
              spousePortrait={node.spouse ? portraits[node.spouse.id] : undefined}
              isSelected={selected === node.id}
              onSelect={setSelected}
              onToggle={toggleNode}
            />
          ))}
        </div>
      </div>

      {/* Controls: bottom-right on desktop, above the tab bar on mobile. */}
      <div className="pointer-events-none absolute bottom-4 right-3 flex flex-col gap-2 sm:right-5">
        <div className="pointer-events-auto flex flex-col overflow-hidden rounded-full border border-border/12 bg-card/80 shadow-elevated backdrop-blur-xl">
          <button
            type="button"
            onClick={() => zoomByStep(1.25)}
            className="touch-target flex items-center justify-center px-2.5 text-muted-foreground transition-colors hover:text-gold-100"
            aria-label="Zoom in"
          >
            <Plus className="h-4 w-4" />
          </button>
          <span className="mx-2 h-px bg-border/12" />
          <button
            type="button"
            onClick={() => zoomByStep(0.8)}
            className="touch-target flex items-center justify-center px-2.5 text-muted-foreground transition-colors hover:text-gold-100"
            aria-label="Zoom out"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="mx-2 h-px bg-border/12" />
          <button
            type="button"
            onClick={fitToView}
            className="touch-target flex items-center justify-center px-2.5 text-muted-foreground transition-colors hover:text-gold-100"
            aria-label="Fit tree to screen"
          >
            <Crosshair className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-3 flex gap-2 sm:left-5">
        <button
          type="button"
          onClick={expandAll}
          className="pointer-events-auto touch-target inline-flex items-center gap-1.5 rounded-full border border-border/12 bg-card/80 px-3.5 font-sans text-xs text-muted-foreground shadow-elevated backdrop-blur-xl transition-colors hover:text-gold-100"
        >
          <Maximize2 className="h-3.5 w-3.5" />
          Expand all
        </button>
        <button
          type="button"
          onClick={collapseAll}
          className="pointer-events-auto touch-target inline-flex items-center rounded-full border border-border/12 bg-card/80 px-3.5 font-sans text-xs text-muted-foreground shadow-elevated backdrop-blur-xl transition-colors hover:text-gold-100"
        >
          Collapse
        </button>
      </div>

      {/* Detail sheet for the tapped person: the mobile-friendly way to get
          from a small node to a full profile. */}
      {selectedNode && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center px-3 pb-3">
          <div className="pointer-events-auto w-full max-w-md animate-sheet-up rounded-2xl border border-border/12 bg-card/90 p-4 shadow-float backdrop-blur-xl">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="label-mono text-[0.625rem] text-gold-200">
                  Generation {selectedNode.person.generation}
                </p>
                <p className="mt-1 truncate font-display text-fluid-lg text-foreground">
                  {fullName(selectedNode.person)}
                </p>
                <p className="mt-0.5 font-sans text-xs text-muted-foreground">
                  {formatLifespan(selectedNode.person)}
                  {selectedNode.person.occupation ? ` · ${selectedNode.person.occupation}` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="shrink-0 font-sans text-xs text-muted-foreground underline underline-offset-4"
              >
                Close
              </button>
            </div>
            <p className="mt-2.5 line-clamp-2 font-serif text-fluid-sm leading-relaxed text-muted-foreground">
              {selectedNode.person.summary}
            </p>
            <Link
              href={`/people/${selectedNode.person.slug}`}
              className="mt-3 inline-flex touch-target items-center font-sans text-sm text-gold-200 underline underline-offset-4"
            >
              Open full profile
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

interface TreeNodeCardProps {
  readonly node: TreeNode;
  readonly portrait: MediaAsset | undefined;
  readonly spousePortrait: MediaAsset | undefined;
  readonly isSelected: boolean;
  readonly onSelect: (id: ID) => void;
  readonly onToggle: (id: ID) => void;
}

function TreeNodeCard({
  node,
  portrait,
  spousePortrait,
  isSelected,
  onSelect,
  onToggle,
}: TreeNodeCardProps): React.ReactElement {
  const { nodeWidth, nodeHeight, spouseWidth } = DEFAULT_LAYOUT;

  return (
    <div
      className="absolute"
      style={{ left: node.x, top: node.y, width: node.spouse ? nodeWidth + spouseWidth : nodeWidth }}
    >
      <div className="flex items-stretch">
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          style={{ width: nodeWidth, height: nodeHeight }}
          className={`flex items-center gap-2.5 border bg-card/80 px-2.5 text-left backdrop-blur-sm transition-[border-color,box-shadow] duration-300 ${
            isSelected
              ? 'border-gold/60 shadow-[0_0_0_2px_hsl(var(--gold)/0.22),0_0_24px_-6px_hsl(var(--gold)/0.5)]'
              : 'border-border/12 hover:border-gold/30'
          }`}
        >
          <span className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white/[0.095] ring-1 ring-border/12">
            {portrait ? (
              // eslint-disable-next-line @next/next/no-img-element -- inside a
              // transformed canvas; next/image's layout machinery fights the
              // scale transform and offers nothing here at this size.
              <img
                src={portrait.src}
                alt=""
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center font-display text-sm text-gold/60">
                {node.person.givenName.charAt(0)}
              </span>
            )}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-display text-[0.9375rem] leading-tight text-foreground">
              {node.person.givenName}
            </span>
            <span className="block truncate font-display text-[0.9375rem] leading-tight text-foreground">
              {node.person.familyName}
            </span>
            <span className="mt-0.5 block truncate font-sans text-[0.625rem] text-muted-foreground">
              {formatLifespan(node.person)}
            </span>
          </span>
        </button>

        {node.spouse && (
          <>
            <span
              aria-hidden
              className="flex items-center justify-center px-1 text-gold/60"
              style={{ height: nodeHeight }}
            >
              <span className="h-px w-3 bg-gold/40" />
            </span>
            <Link
              href={`/people/${node.spouse.slug}`}
              style={{ width: spouseWidth - 20, height: nodeHeight }}
              className="flex items-center gap-2 border border-dashed border-border/20 bg-white/[0.035] px-2.5 transition-colors hover:border-gold/35"
            >
              <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-full bg-white/[0.095] ring-1 ring-border/12">
                {spousePortrait ? (
                  // eslint-disable-next-line @next/next/no-img-element -- see above
                  <img
                    src={spousePortrait.src}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center font-display text-xs text-gold/60">
                    {node.spouse.givenName.charAt(0)}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[0.8125rem] leading-tight text-foreground/85">
                  {node.spouse.givenName}
                </span>
                <span className="block truncate font-sans text-[0.5625rem] text-muted-foreground">
                  {formatLifespan(node.spouse)}
                </span>
              </span>
            </Link>
          </>
        )}
      </div>

      {node.hasHiddenChildren && (
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          className="absolute -bottom-3 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border/15 bg-card text-muted-foreground shadow-elevated transition-colors hover:border-gold/50 hover:text-gold-100"
          aria-label={`Show children of ${fullName(node.person)}`}
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      )}
      {!node.hasHiddenChildren && node.childIds.length > 0 && (
        <button
          type="button"
          onClick={() => onToggle(node.id)}
          className="absolute -bottom-3 left-1/2 z-10 flex h-6 w-6 -translate-x-1/2 items-center justify-center rounded-full border border-border/15 bg-card text-muted-foreground shadow-elevated transition-colors hover:border-gold/50 hover:text-gold-100"
          aria-label={`Hide children of ${fullName(node.person)}`}
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
