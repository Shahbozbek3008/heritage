import type { ID, Person } from '@/types/heritage';

export interface TreeNode {
  readonly id: ID;
  readonly person: Person;
  /** Spouse rendered adjoined to this node, if any. */
  readonly spouse?: Person;
  readonly x: number;
  readonly y: number;
  readonly depth: number;
  readonly childIds: readonly ID[];
  readonly parentId: ID | null;
  readonly hasHiddenChildren: boolean;
}

export interface TreeEdge {
  readonly id: string;
  readonly fromId: ID;
  readonly toId: ID;
  /** Path through the "elbow" gutter between generations. */
  readonly path: string;
}

export interface TreeLayout {
  readonly nodes: readonly TreeNode[];
  readonly edges: readonly TreeEdge[];
  readonly width: number;
  readonly height: number;
}

export interface LayoutOptions {
  readonly nodeWidth: number;
  readonly nodeHeight: number;
  /** Horizontal gap between sibling subtrees. */
  readonly hGap: number;
  /** Vertical gap between generations. */
  readonly vGap: number;
  /** Extra width when a node carries an adjoined spouse. */
  readonly spouseWidth: number;
  readonly padding: number;
}

export const DEFAULT_LAYOUT: LayoutOptions = {
  nodeWidth: 168,
  nodeHeight: 92,
  hGap: 28,
  vGap: 76,
  spouseWidth: 148,
  padding: 48,
};

interface Frame {
  readonly person: Person;
  readonly spouse: Person | undefined;
  readonly parentId: ID | null;
  readonly depth: number;
  readonly children: Frame[];
  width: number;
  x: number;
  hasHiddenChildren: boolean;
}

/**
 * Tidy top-down layout via two passes.
 *
 * Pass one measures each subtree bottom-up: a leaf is its own width, a parent
 * is the greater of its own width and the summed width of its children. Pass
 * two assigns absolute x positions top-down, centring every parent over the
 * span its children actually occupy.
 *
 * This avoids the sibling-overlap failure of naive index-based placement,
 * where a wide subtree silently collides with the one beside it.
 */
export function buildTreeLayout(
  people: readonly Person[],
  rootId: ID,
  expandedIds: ReadonlySet<ID>,
  options: LayoutOptions = DEFAULT_LAYOUT,
): TreeLayout {
  const byId = new Map<ID, Person>(people.map((p) => [p.id, p]));
  const root = byId.get(rootId);
  if (!root) return { nodes: [], edges: [], width: 0, height: 0 };

  const { nodeWidth, nodeHeight, hGap, vGap, spouseWidth, padding } = options;

  /** Spouses are drawn adjoined, so they must not also be laid out as nodes. */
  const adjoined = new Set<ID>();

  const frameWidth = (frame: Frame): number =>
    frame.spouse ? nodeWidth + spouseWidth : nodeWidth;

  // ---- Pass 1: build the frame tree and measure subtree widths ----
  const build = (person: Person, parentId: ID | null, depth: number, seen: ReadonlySet<ID>): Frame => {
    // Guard against cycles in imported data (they do occur in real GEDCOMs).
    const nextSeen = new Set(seen).add(person.id);

    const spouse = person.spouseIds
      .map((id) => byId.get(id))
      .find((s): s is Person => s !== undefined && !nextSeen.has(s.id) && !adjoined.has(s.id));
    if (spouse) adjoined.add(spouse.id);

    const frame: Frame = {
      person,
      spouse,
      parentId,
      depth,
      children: [],
      width: 0,
      x: 0,
      hasHiddenChildren: false,
    };

    const childPeople = person.childIds
      .map((id) => byId.get(id))
      .filter((c): c is Person => c !== undefined && !nextSeen.has(c.id));

    const isExpanded = expandedIds.has(person.id);
    if (isExpanded) {
      for (const child of childPeople) {
        frame.children.push(build(child, person.id, depth + 1, nextSeen));
      }
    }
    frame.hasHiddenChildren = !isExpanded && childPeople.length > 0;

    const own = frameWidth(frame);
    if (frame.children.length === 0) {
      frame.width = own;
    } else {
      const childrenWidth =
        frame.children.reduce((sum, c) => sum + c.width, 0) + hGap * (frame.children.length - 1);
      frame.width = Math.max(own, childrenWidth);
    }
    return frame;
  };

  const rootFrame = build(root, null, 0, new Set());

  // ---- Pass 2: assign absolute positions ----
  const nodes: TreeNode[] = [];
  const edges: TreeEdge[] = [];
  let maxDepth = 0;

  const place = (frame: Frame, left: number): void => {
    frame.x = left;
    maxDepth = Math.max(maxDepth, frame.depth);

    const own = frameWidth(frame);
    // Centre this node within the horizontal span its subtree occupies.
    const nodeX = left + (frame.width - own) / 2;
    const nodeY = padding + frame.depth * (nodeHeight + vGap);

    nodes.push({
      id: frame.person.id,
      person: frame.person,
      ...(frame.spouse ? { spouse: frame.spouse } : {}),
      x: nodeX,
      y: nodeY,
      depth: frame.depth,
      childIds: frame.children.map((c) => c.person.id),
      parentId: frame.parentId,
      hasHiddenChildren: frame.hasHiddenChildren,
    });

    let cursor = left;
    if (frame.children.length > 0) {
      const childrenWidth =
        frame.children.reduce((sum, c) => sum + c.width, 0) + hGap * (frame.children.length - 1);
      // If the parent is wider than its children, centre the children under it.
      cursor = left + Math.max(0, (frame.width - childrenWidth) / 2);
    }

    for (const child of frame.children) {
      place(child, cursor);

      const parentCx = nodeX + nodeWidth / 2;
      const parentBottom = nodeY + nodeHeight;
      const childOwn = frameWidth(child);
      const childX = cursor + (child.width - childOwn) / 2;
      const childCx = childX + nodeWidth / 2;
      const childTop = padding + child.depth * (nodeHeight + vGap);
      const midY = parentBottom + vGap / 2;

      edges.push({
        id: `${frame.person.id}-${child.person.id}`,
        fromId: frame.person.id,
        toId: child.person.id,
        path: `M ${parentCx} ${parentBottom} V ${midY} H ${childCx} V ${childTop}`,
      });

      cursor += child.width + hGap;
    }
  };

  place(rootFrame, padding);

  const width = rootFrame.width + padding * 2;
  const height = padding * 2 + (maxDepth + 1) * nodeHeight + maxDepth * vGap;

  return { nodes, edges, width, height };
}

/** Every descendant id of `rootId`, for "expand all". */
export function collectDescendantIds(people: readonly Person[], rootId: ID): ReadonlySet<ID> {
  const byId = new Map<ID, Person>(people.map((p) => [p.id, p]));
  const result = new Set<ID>();
  const walk = (id: ID): void => {
    if (result.has(id)) return;
    result.add(id);
    const person = byId.get(id);
    if (!person) return;
    for (const childId of person.childIds) walk(childId);
  };
  walk(rootId);
  return result;
}

/** Path of ids from the root down to `targetId`, for focusing a person. */
export function findAncestryPath(
  people: readonly Person[],
  rootId: ID,
  targetId: ID,
): readonly ID[] {
  const byId = new Map<ID, Person>(people.map((p) => [p.id, p]));
  const path: ID[] = [];

  const walk = (id: ID, seen: ReadonlySet<ID>): boolean => {
    if (seen.has(id)) return false;
    const person = byId.get(id);
    if (!person) return false;
    path.push(id);
    if (id === targetId) return true;
    const nextSeen = new Set(seen).add(id);
    for (const childId of person.childIds) {
      if (walk(childId, nextSeen)) return true;
    }
    // Spouses are reachable as adjoined nodes of the same frame.
    for (const spouseId of person.spouseIds) {
      if (spouseId === targetId) return true;
    }
    path.pop();
    return false;
  };

  return walk(rootId, new Set()) ? path : [];
}
