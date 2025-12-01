'use client';

import { Message, Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, LIFELINE_SPACING, LIFELINE_START_X, LIFELINE_START_Y, MESSAGE_SPACING, ACTIVATION_WIDTH } from '@/types/diagram';
import { useState, useRef, useEffect, useMemo } from 'react';

// Message label and description layout constants
const LABEL_BOX_WIDTH = 100;
const LABEL_BOX_HEIGHT = 18;
const LABEL_BOX_OFFSET_Y = 22; // Above the arrow line
const DESCRIPTION_BOX_WIDTH = 180;
const DESCRIPTION_BOX_MIN_HEIGHT = 20;
const DESCRIPTION_BOX_LINE_HEIGHT = 16;
const DESCRIPTION_BOX_OFFSET_Y = 6; // Below the arrow line
const DESCRIPTION_CHARS_PER_LINE = 25; // Approximate characters per line

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
  const descriptionInputRef = useRef<HTMLTextAreaElement>(null);

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

  // Calculate description box dimensions based on text length
  // Must be called before any early returns to satisfy React hooks rules
  const descriptionLayout = useMemo(() => {
    const displayText = message.description || (isSelected ? 'Double-click to add description' : '');
    const estimatedLines = Math.max(1, Math.ceil(displayText.length / DESCRIPTION_CHARS_PER_LINE));
    const boxHeight = Math.max(DESCRIPTION_BOX_MIN_HEIGHT, estimatedLines * DESCRIPTION_BOX_LINE_HEIGHT + 8);
    const editHeight = Math.max(60, estimatedLines * DESCRIPTION_BOX_LINE_HEIGHT + 16);
    return { displayText, boxHeight, editHeight };
  }, [message.description, isSelected]);

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
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
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
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  ref={labelInputRef}
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onBlur={handleLabelBlur}
                  onKeyDown={handleLabelKeyDown}
                  style={{ width: '100%', height: '100%', textAlign: 'center', fontSize: '12px', fontWeight: 500, color: '#374151', backgroundColor: 'white', outline: 'none', border: '1px solid #3B82F6', borderRadius: '4px', padding: '0 4px' }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
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
            height={descriptionLayout.boxHeight}
            fill="white"
            rx={4}
            className="cursor-pointer"
            onDoubleClick={handleDescriptionDoubleClick}
          />
          {isEditingDescription ? (
            <foreignObject x={midX - DESCRIPTION_BOX_WIDTH / 2} y={y + DESCRIPTION_BOX_OFFSET_Y} width={DESCRIPTION_BOX_WIDTH} height={descriptionLayout.editHeight}>
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '4px' }}>
                <textarea
                  ref={descriptionInputRef}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  onKeyDown={handleDescriptionKeyDown}
                  placeholder="Add description..."
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    textAlign: 'center', 
                    fontSize: '12px', 
                    color: '#6B7280', 
                    backgroundColor: 'white', 
                    outline: 'none', 
                    border: '1px solid #3B82F6', 
                    borderRadius: '4px', 
                    padding: '4px',
                    resize: 'none',
                    lineHeight: '1.3'
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </foreignObject>
          ) : (
            <foreignObject 
              x={midX - DESCRIPTION_BOX_WIDTH / 2} 
              y={y + DESCRIPTION_BOX_OFFSET_Y} 
              width={DESCRIPTION_BOX_WIDTH} 
              height={descriptionLayout.boxHeight}
            >
              <div 
                style={{ 
                  width: '100%', 
                  height: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '4px',
                  boxSizing: 'border-box'
                }}
                onDoubleClick={handleDescriptionDoubleClick}
              >
                <p 
                  style={{ 
                    margin: 0,
                    fontSize: '12px', 
                    color: '#6B7280', 
                    textAlign: 'center',
                    fontStyle: 'italic',
                    lineHeight: '1.3',
                    wordWrap: 'break-word',
                    overflowWrap: 'break-word',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  {descriptionLayout.displayText}
                </p>
              </div>
            </foreignObject>
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
