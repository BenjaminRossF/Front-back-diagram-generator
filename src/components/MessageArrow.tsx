'use client';

import { Message, Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, LIFELINE_SPACING, LIFELINE_START_X, LIFELINE_START_Y, MESSAGE_SPACING, ACTIVATION_WIDTH } from '@/types/diagram';
import { useState, useRef, useEffect } from 'react';

// Message label and description layout constants
const LABEL_BOX_WIDTH = 100;
const LABEL_BOX_HEIGHT = 18;
const LABEL_BOX_OFFSET_Y = 22; // Above the arrow line
const DESCRIPTION_BOX_WIDTH = 120;
const DESCRIPTION_BOX_HEIGHT = 16;
const DESCRIPTION_BOX_OFFSET_Y = 6; // Below the arrow line

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
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editLabel, setEditLabel] = useState(message.label);
  const [editDescription, setEditDescription] = useState(message.description || '');
  const labelInputRef = useRef<HTMLInputElement>(null);
  const descriptionInputRef = useRef<HTMLInputElement>(null);

  const fromLifeline = lifelines.find((l) => l.id === message.fromLifelineId);
  const toLifeline = lifelines.find((l) => l.id === message.toLifelineId);

  useEffect(() => {
    if (isEditingLabel && labelInputRef.current) {
      labelInputRef.current.focus();
      labelInputRef.current.select();
    }
  }, [isEditingLabel]);

  useEffect(() => {
    if (isEditingDescription && descriptionInputRef.current) {
      descriptionInputRef.current.focus();
      descriptionInputRef.current.select();
    }
  }, [isEditingDescription]);

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

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLabel(true);
    setEditLabel(message.label);
  };

  const handleDescriptionDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingDescription(true);
    setEditDescription(message.description || '');
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    if (editLabel !== message.label) {
      onUpdate({ ...message, label: editLabel });
    }
  };

  const handleDescriptionBlur = () => {
    setIsEditingDescription(false);
    const trimmedDescription = editDescription.trim();
    if (trimmedDescription !== (message.description || '')) {
      onUpdate({ ...message, description: trimmedDescription || undefined });
    }
  };

  const handleLabelKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setIsEditingLabel(false);
      setEditLabel(message.label);
    }
  };

  const handleDescriptionKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDescriptionBlur();
    } else if (e.key === 'Escape') {
      setIsEditingDescription(false);
      setEditDescription(message.description || '');
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

      {/* Label background and text (above the arrow) */}
      {message.label && (
        <>
          <rect
            x={midX - LABEL_BOX_WIDTH / 2}
            y={y - LABEL_BOX_OFFSET_Y}
            width={LABEL_BOX_WIDTH}
            height={LABEL_BOX_HEIGHT}
            fill="white"
            rx={4}
            className="cursor-pointer"
            onDoubleClick={handleLabelDoubleClick}
          />
          {isEditingLabel ? (
            <foreignObject x={midX - LABEL_BOX_WIDTH / 2} y={y - LABEL_BOX_OFFSET_Y} width={LABEL_BOX_WIDTH} height={LABEL_BOX_HEIGHT}>
              <input
                ref={labelInputRef}
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleLabelKeyDown}
                className="w-full h-full text-center text-xs font-medium text-gray-700 bg-transparent outline-none border border-blue-500 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </foreignObject>
          ) : (
            <text
              x={midX}
              y={y - LABEL_BOX_OFFSET_Y + LABEL_BOX_HEIGHT / 2 + 2}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-700 cursor-pointer select-none"
              onDoubleClick={handleLabelDoubleClick}
            >
              {message.label}
            </text>
          )}
        </>
      )}

      {/* Description background and text (below the arrow) */}
      {(message.description || isSelected) && (
        <>
          <rect
            x={midX - DESCRIPTION_BOX_WIDTH / 2}
            y={y + DESCRIPTION_BOX_OFFSET_Y}
            width={DESCRIPTION_BOX_WIDTH}
            height={DESCRIPTION_BOX_HEIGHT}
            fill="white"
            rx={4}
            className="cursor-pointer"
            onDoubleClick={handleDescriptionDoubleClick}
          />
          {isEditingDescription ? (
            <foreignObject x={midX - DESCRIPTION_BOX_WIDTH / 2} y={y + DESCRIPTION_BOX_OFFSET_Y} width={DESCRIPTION_BOX_WIDTH} height={DESCRIPTION_BOX_HEIGHT}>
              <input
                ref={descriptionInputRef}
                type="text"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                onKeyDown={handleDescriptionKeyDown}
                placeholder="Add description..."
                className="w-full h-full text-center text-xs text-gray-500 bg-transparent outline-none border border-blue-500 rounded"
                onClick={(e) => e.stopPropagation()}
              />
            </foreignObject>
          ) : (
            <text
              x={midX}
              y={y + DESCRIPTION_BOX_OFFSET_Y + DESCRIPTION_BOX_HEIGHT / 2 + 4}
              textAnchor="middle"
              className="text-xs fill-gray-500 cursor-pointer select-none italic"
              onDoubleClick={handleDescriptionDoubleClick}
            >
              {message.description || (isSelected ? 'Double-click to add description' : '')}
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
