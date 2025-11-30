'use client';

import { Activation, Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, LIFELINE_SPACING, LIFELINE_START_X, LIFELINE_START_Y, MESSAGE_SPACING, ACTIVATION_WIDTH } from '@/types/diagram';

interface ActivationBarProps {
  activation: Activation;
  lifeline: Lifeline;
}

function getLifelineX(lifeline: Lifeline): number {
  return LIFELINE_START_X + lifeline.order * LIFELINE_SPACING + LIFELINE_HEADER_WIDTH / 2;
}

function getMessageY(order: number): number {
  return LIFELINE_START_Y + LIFELINE_HEADER_HEIGHT + 30 + order * MESSAGE_SPACING;
}

export default function ActivationBar({
  activation,
  lifeline,
}: ActivationBarProps) {
  const x = getLifelineX(lifeline) - ACTIVATION_WIDTH / 2;
  const startY = getMessageY(activation.startMessageOrder) - 5;
  const endY = getMessageY(activation.endMessageOrder) + 5;
  const height = Math.max(endY - startY, 20);

  return (
    <g>
      <rect
        x={x}
        y={startY}
        width={ACTIVATION_WIDTH}
        height={height}
        rx={2}
        fill={lifeline.color}
        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
      />
    </g>
  );
}
