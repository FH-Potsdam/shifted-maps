import { Force, SimulationLinkDatum, SimulationNodeDatum } from 'd3-force';

const MERGE_STRENGTH = 1.6;
const MERGE_DAMPING = 0.35;
const SPLIT_STRENGTH = 0.45;
const SPLIT_DAMPING = 0.2;
const SPLIT_PADDING = 8;
const CONNECTION_FADE_END_ALPHA = 0.1;
const SIZE_SPRING_STRENGTH = 0.18;
const SIZE_SPRING_DAMPING = 0.55;
const SIZE_REST_DELTA = 0.01;
const SIZE_REST_SPEED = 0.01;

export interface SpringState {
  value: number;
  velocity: number;
}

export function advanceSpring({ value, velocity }: SpringState, target: number): SpringState {
  const delta = target - value;
  const nextVelocity = (velocity + delta * SIZE_SPRING_STRENGTH) * SIZE_SPRING_DAMPING;

  if (Math.abs(delta) < SIZE_REST_DELTA && Math.abs(nextVelocity) < SIZE_REST_SPEED) {
    return { value: target, velocity: 0 };
  }

  return {
    value: value + nextVelocity,
    velocity: nextVelocity,
  };
}

export function obsoleteConnectionOpacity(alpha: number, alphaMin: number): number {
  if (alpha <= Math.max(alphaMin, CONNECTION_FADE_END_ALPHA)) {
    return 0;
  }

  const progress = Math.min(1, (alpha - CONNECTION_FADE_END_ALPHA) / (1 - CONNECTION_FADE_END_ALPHA));

  return progress * progress;
}

export interface ClusterMotionAccessors<Node extends SimulationNodeDatum> {
  key: (node: Node) => unknown;
  parentKey: (node: Node) => unknown;
  visible: (node: Node) => boolean;
  radius: (node: Node) => number;
  target: (node: Node) => { x: number; y: number };
}

export interface TransitionMotionNode extends SimulationNodeDatum {
  radiusVelocity: number;
  strokeWidthVelocity: number;
}

export interface ClusterTransitionAccessors<Node extends TransitionMotionNode>
  extends ClusterMotionAccessors<Node> {
  snapSize: (node: Node) => void;
}

export function beginSplitTransition<Node extends TransitionMotionNode>(
  node: Node,
  parent: Node,
  accessors: ClusterTransitionAccessors<Node>
) {
  accessors.snapSize(node);
  node.radiusVelocity = 0;
  node.strokeWidthVelocity = 0;

  if (parent.x != null && parent.y != null) {
    node.x = parent.x;
    node.y = parent.y;
  }

  node.vx = (node.vx || 0) * 0.1;
  node.vy = (node.vy || 0) * 0.1;
}

export default function createClusterForce<
  Node extends SimulationNodeDatum,
  Link extends SimulationLinkDatum<Node> | undefined = undefined,
>(accessors: ClusterMotionAccessors<Node>): Force<Node, Link> {
  let nodes: Node[] = [];
  let nodesByKey = new Map(nodes.map((node) => [accessors.key(node), node]));

  const force: Force<Node, Link> = () => {
    nodes.forEach((node) => {
      const parentKey = accessors.parentKey(node);

      if (parentKey == null || node.x == null || node.y == null) {
        return;
      }

      const parentNode = nodesByKey.get(parentKey);

      if (parentNode?.x == null || parentNode.y == null) {
        return;
      }

      const parentVelocityX = parentNode.vx || 0;
      const parentVelocityY = parentNode.vy || 0;
      const nodeVelocityX = node.vx || 0;
      const nodeVelocityY = node.vy || 0;
      const relativeVelocityX = nodeVelocityX - parentVelocityX;
      const relativeVelocityY = nodeVelocityY - parentVelocityY;
      let offsetX = node.x - parentNode.x;
      let offsetY = node.y - parentNode.y;

      if (!accessors.visible(node)) {
        node.vx = nodeVelocityX - offsetX * MERGE_STRENGTH - relativeVelocityX * MERGE_DAMPING;
        node.vy = nodeVelocityY - offsetY * MERGE_STRENGTH - relativeVelocityY * MERGE_DAMPING;
        return;
      }

      let distance = Math.hypot(offsetX, offsetY);

      if (distance === 0) {
        const target = accessors.target(node);
        const parentTarget = accessors.target(parentNode);

        offsetX = target.x - parentTarget.x;
        offsetY = target.y - parentTarget.y;
        distance = Math.hypot(offsetX, offsetY);
      }

      if (distance === 0) {
        return;
      }

      const releaseDistance = accessors.radius(parentNode) + accessors.radius(node) + SPLIT_PADDING;

      if (distance >= releaseDistance) {
        return;
      }

      const directionX = offsetX / distance;
      const directionY = offsetY / distance;
      const radialVelocity = relativeVelocityX * directionX + relativeVelocityY * directionY;
      const acceleration = (releaseDistance - distance) * SPLIT_STRENGTH - radialVelocity * SPLIT_DAMPING;

      node.vx = nodeVelocityX + directionX * acceleration;
      node.vy = nodeVelocityY + directionY * acceleration;
    });
  };

  force.initialize = (nextNodes) => {
    nodes = nextNodes;
    nodesByKey = new Map(nodes.map((node) => [accessors.key(node), node]));
  };

  return force;
}
