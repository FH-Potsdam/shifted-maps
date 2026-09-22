import { expect, test } from 'vitest';
import { forceSimulation, forceX, forceY, SimulationNodeDatum } from 'd3-force';
import createClusterForce, {
  advanceSpring,
  beginSplitTransition,
  obsoleteConnectionOpacity,
} from '../../stores/ClusterMotion';

interface MotionNode extends SimulationNodeDatum {
  id: string;
  parentId?: string;
  visible: boolean;
  radius: number;
  presentationRadius: number;
  radiusVelocity: number;
  strokeWidthVelocity: number;
  target: { x: number; y: number };
}

const motionAccessors = {
  key: (node: MotionNode) => node.id,
  parentKey: (node: MotionNode) => node.parentId,
  visible: (node: MotionNode) => node.visible,
  radius: (node: MotionNode) => node.radius,
  target: (node: MotionNode) => node.target,
  snapSize: (node: MotionNode) => {
    node.presentationRadius = node.radius;
  },
};

function createMotionSimulation(nodes: MotionNode[]) {
  return forceSimulation(nodes)
    .force(
      'x',
      forceX<MotionNode>()
        .x((node) => node.target.x)
        .strength(0.1)
    )
    .force(
      'y',
      forceY<MotionNode>()
        .y((node) => node.target.y)
        .strength(0.1)
    )
    .force('cluster', createClusterForce(motionAccessors))
    .velocityDecay(0.9)
    .stop();
}

test('an obsolete connection fades before the cluster motion settles', () => {
  const simulation = forceSimulation([]).alpha(1).stop();
  const frames = [
    {
      alpha: simulation.alpha(),
      opacity: obsoleteConnectionOpacity(simulation.alpha(), simulation.alphaMin()),
    },
  ];

  while (simulation.alpha() >= simulation.alphaMin()) {
    simulation.tick();
    frames.push({
      alpha: simulation.alpha(),
      opacity: obsoleteConnectionOpacity(simulation.alpha(), simulation.alphaMin()),
    });
  }

  expect(frames[0].opacity).toBe(1);
  expect(frames.every(({ opacity }) => opacity >= 0 && opacity <= 1)).toBe(true);
  expect(frames.every((frame, index) => index === 0 || frame.opacity <= frames[index - 1].opacity)).toBe(true);

  const invisibleBeforeSettling = frames.find(({ alpha, opacity }) => opacity === 0 && alpha >= simulation.alphaMin());

  expect(invisibleBeforeSettling).toBeDefined();
});

test('a clustered place separates from its parent without an initial position jump', () => {
  const parent: MotionNode = {
    id: 'parent',
    visible: true,
    radius: 20,
    presentationRadius: 20,
    radiusVelocity: 0,
    strokeWidthVelocity: 0,
    target: { x: 0, y: 0 },
    x: 0,
    y: 0,
  };
  const child: MotionNode = {
    id: 'child',
    parentId: parent.id,
    visible: true,
    radius: 10,
    presentationRadius: 0,
    radiusVelocity: 2,
    strokeWidthVelocity: 1,
    target: { x: 100, y: 0 },
    x: 100,
    y: parent.y,
  };

  beginSplitTransition(child, parent, motionAccessors);

  const simulation = createMotionSimulation([parent, child]);

  expect(child.x).toBe(parent.x);
  expect(child.y).toBe(parent.y);
  expect(child.presentationRadius).toBe(child.radius);
  expect(child.radiusVelocity).toBe(0);
  expect(child.strokeWidthVelocity).toBe(0);

  simulation.tick();

  expect(child.x).toBeGreaterThan(parent.x!);
  expect(child.y).toBe(parent.y);
});

test('a newly clustered place converges inside its parent', () => {
  const parent: MotionNode = {
    id: 'parent',
    visible: true,
    radius: 20,
    presentationRadius: 20,
    radiusVelocity: 0,
    strokeWidthVelocity: 0,
    target: { x: 0, y: 0 },
    x: 0,
    y: 0,
  };
  const child: MotionNode = {
    id: 'child',
    parentId: parent.id,
    visible: false,
    radius: 10,
    presentationRadius: 10,
    radiusVelocity: 0,
    strokeWidthVelocity: 0,
    target: { x: 100, y: 0 },
    x: 100,
    y: 0,
  };
  const simulation = createMotionSimulation([parent, child]);

  simulation.tick(120);

  expect(Math.hypot(child.x! - parent.x!, child.y! - parent.y!)).toBeLessThan(child.radius);
});

test('retargeting continues from the current position and converges on the new parent', () => {
  const firstParent: MotionNode = {
    id: 'first-parent',
    visible: true,
    radius: 20,
    presentationRadius: 20,
    radiusVelocity: 0,
    strokeWidthVelocity: 0,
    target: { x: 0, y: 0 },
    x: 0,
    y: 0,
  };
  const nextParent: MotionNode = {
    id: 'next-parent',
    visible: true,
    radius: 20,
    presentationRadius: 20,
    radiusVelocity: 0,
    strokeWidthVelocity: 0,
    target: { x: 200, y: 0 },
    x: 200,
    y: 0,
  };
  const child: MotionNode = {
    id: 'child',
    parentId: firstParent.id,
    visible: false,
    radius: 10,
    presentationRadius: 10,
    radiusVelocity: 0,
    strokeWidthVelocity: 0,
    target: { x: 100, y: 0 },
    x: 100,
    y: 0,
  };
  const simulation = createMotionSimulation([firstParent, nextParent, child]);

  simulation.tick(10);
  const positionBeforeRetarget = child.x!;
  child.parentId = nextParent.id;
  simulation.alpha(1).tick();

  expect(Math.abs(child.x! - positionBeforeRetarget)).toBeLessThan(Math.abs(nextParent.x! - positionBeforeRetarget));

  simulation.tick(120);

  expect(Math.hypot(child.x! - nextParent.x!, child.y! - nextParent.y!)).toBeLessThan(child.radius);
});

test('a zoom-scaled size settles at its target with only minimal overshoot', () => {
  const target = 20;
  const frames = [{ value: 40, velocity: 0 }];

  while (frames.at(-1)!.value !== target && frames.length < 200) {
    frames.push(advanceSpring(frames.at(-1)!, target));
  }

  expect(frames[1].value).toBeLessThan(frames[0].value);
  expect(Math.min(...frames.map(({ value }) => value))).toBeGreaterThanOrEqual(target * 0.98);
  expect(frames.at(-1)).toEqual({ value: target, velocity: 0 });
});
