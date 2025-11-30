'use client';

import { Message, Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, LIFELINE_SPACING, LIFELINE_START_X, LIFELINE_START_Y, MESSAGE_SPACING, ACTIVATION_WIDTH } from '@/types/diagram';
import { useState, useRef, useEffect } from 'react';

interface MessageArrowProps {
  message: Message;
  lifelines: Lifeline[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (message: Message) => void;
  onDelete: (id: string) => void;
}

function getLifelineX(lifeline: Lifeline): number {
  return LIFELINE_START_X + lifeline.order * LIFELINE_SPACING + LIFELINE_HEADER_WIDTH / 2;
}

function getMessageY(order: number): number {
  return LIFELINE_START_Y + LIFELINE_HEADER_HEIGHT + 30 + order * MESSAGE_SPACING;
}

export default function MessageArrow({
  message,
  lifelines,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: MessageArrowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(message.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const fromLifeline = lifelines.find((l) => l.id === message.fromLifelineId);
  const toLifeline = lifelines.find((l) => l.id === message.toLifelineId);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!fromLifeline || !toLifeline) return null;

  const fromX = getLifelineX(fromLifeline);
  const toX = getLifelineX(toLifeline);
  const y = getMessageY(message.order);

  // Adjust for activation bars
  const isLeftToRight = fromX < toX;
  const adjustedFromX = isLeftToRight ? fromX + ACTIVATION_WIDTH / 2 : fromX - ACTIVATION_WIDTH / 2;
  const adjustedToX = isLeftToRight ? toX - ACTIVATION_WIDTH / 2 : toX + ACTIVATION_WIDTH / 2;

  // Calculate midpoint for label
  const midX = (adjustedFromX + adjustedToX) / 2;

  // Arrow properties
  const arrowLength = 10;
  const arrowWidth = 6;
  const isReturn = message.type === 'return';

  // Arrow direction
  const arrowPointX = adjustedToX;
  const arrowDirection = isLeftToRight ? -1 : 1;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(message.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditLabel(message.label);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    if (editLabel !== message.label) {
      onUpdate({ ...message, label: editLabel });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditLabel(message.label);
    }
  };

  return (
    <g onClick={handleClick}>
      {/* Line */}
      <line
        x1={adjustedFromX}
        y1={y}
        x2={adjustedToX}
        y2={y}
        stroke={isReturn ? '#6B7280' : '#374151'}
        strokeWidth={isSelected ? 3 : 2}
        strokeDasharray={isReturn ? '8,4' : 'none'}
        className="cursor-pointer"
      />
      
      {/* Arrowhead */}
      {isReturn ? (
        // Open arrowhead for return messages
        <polyline
          points={`${arrowPointX + arrowDirection * arrowLength},${y - arrowWidth} ${arrowPointX},${y} ${arrowPointX + arrowDirection * arrowLength},${y + arrowWidth}`}
          fill="none"
          stroke="#6B7280"
          strokeWidth={2}
        />
      ) : (
        // Filled arrowhead for sync messages
        <polygon
          points={`${arrowPointX},${y} ${arrowPointX + arrowDirection * arrowLength},${y - arrowWidth} ${arrowPointX + arrowDirection * arrowLength},${y + arrowWidth}`}
          fill="#374151"
        />
      )}

      {/* Label background and text */}
      {message.label && (
        <>
          <rect
            x={midX - 50}
            y={y - 22}
            width={100}
            height={18}
            fill="white"
            rx={4}
            className="cursor-pointer"
            onDoubleClick={handleDoubleClick}
          />
          {isEditing ? (
            <foreignObject x={midX - 50} y={y - 22} width={100} height={18}>
              <input
                ref={inputRef}
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full text-center text-xs font-medium text-gray-700 bg-transparent outline-none border border-blue-500 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </foreignObject>
          ) : (
            <text
              x={midX}
              y={y - 10}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700 cursor-pointer select-none"
              onDoubleClick={handleDoubleClick}
            >
              {message.label}
            </text>
          )}
        </>
      )}

      {/* Delete button when selected */}
      {isSelected && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onDelete(message.id);
          }}
          className="cursor-pointer"
        >
          <circle cx={midX + 60} cy={y - 12} r={10} fill="#EF4444" />
          <text
            x={midX + 60}
            y={y - 8}
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
