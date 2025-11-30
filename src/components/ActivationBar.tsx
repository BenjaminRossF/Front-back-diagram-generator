'use client';

import { Activation, Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, LIFELINE_SPACING, LIFELINE_START_X, LIFELINE_START_Y, MESSAGE_SPACING, ACTIVATION_WIDTH } from '@/types/diagram';

interface ActivationBarProps {
  activation: Activation;
  lifeline: Lifeline;
  isActive: boolean;
  onClick: () => void;
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
  isActive,
  onClick,
}: ActivationBarProps) {
  const x = getLifelineX(lifeline) - ACTIVATION_WIDTH / 2;
  const startY = getMessageY(activation.startMessageOrder);
  const endY = getMessageY(activation.endMessageOrder);
  const height = Math.max(endY - startY, 20);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
  };

  return (
    <g
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-pressed={isActive}
      aria-label={`Toggle activation for ${lifeline.name}`}
      className="cursor-pointer focus:outline-none"
    >
      {/* Clickable background area (slightly wider for easier clicking) */}
      <rect
        x={x - 4}
        y={startY}
        width={ACTIVATION_WIDTH + 8}
        height={height}
        fill="transparent"
        className="hover:fill-gray-200/30"
      />
      {/* Activation bar (only visible when active) */}
      {isActive && (
        <rect
          x={x}
          y={startY}
          width={ACTIVATION_WIDTH}
          height={height}
          rx={2}
          fill={lifeline.color}
          filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
        />
      )}
      {/* Inactive indicator (dashed outline when not active) */}
      {!isActive && (
        <rect
          x={x}
          y={startY}
          width={ACTIVATION_WIDTH}
          height={height}
          rx={2}
          fill="transparent"
          stroke={lifeline.color}
          strokeWidth={1}
          strokeDasharray="4,2"
          opacity={0.4}
          className="hover:opacity-70"
        />
      )}
    </g>
  );
}
