'use client';

import { Activation, Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, LIFELINE_SPACING, LIFELINE_START_X, LIFELINE_START_Y, MESSAGE_SPACING, ACTIVATION_WIDTH } from '@/types/diagram';

interface ActivationBarProps {
  activation: Activation;
  lifeline: Lifeline;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
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
  isSelected,
  onSelect,
  onDelete,
}: ActivationBarProps) {
  const x = getLifelineX(lifeline) - ACTIVATION_WIDTH / 2;
  const startY = getMessageY(activation.startMessageOrder) - 5;
  const endY = getMessageY(activation.endMessageOrder) + 5;
  const height = Math.max(endY - startY, 20);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(activation.id);
  };

  return (
    <g onClick={handleClick}>
      <rect
        x={x}
        y={startY}
        width={ACTIVATION_WIDTH}
        height={height}
        rx={2}
        fill={lifeline.color}
        className={`cursor-pointer ${isSelected ? 'stroke-white stroke-2' : ''}`}
        filter="drop-shadow(0 1px 2px rgba(0,0,0,0.2))"
      />
      
      {/* Delete button when selected */}
      {isSelected && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onDelete(activation.id);
          }}
          className="cursor-pointer"
        >
          <circle
            cx={x + ACTIVATION_WIDTH + 12}
            cy={startY + height / 2}
            r={10}
            fill="#EF4444"
          />
          <text
            x={x + ACTIVATION_WIDTH + 12}
            y={startY + height / 2 + 4}
            textAnchor="middle"
            className="text-xs font-bold fill-white select-none"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}
