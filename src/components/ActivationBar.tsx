'use client';

import { useState, useRef, useEffect } from 'react';
import { Activation, Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, LIFELINE_SPACING, LIFELINE_START_X, LIFELINE_START_Y, MESSAGE_SPACING, ACTIVATION_WIDTH } from '@/types/diagram';

// Text label layout constants
const TEXT_BOX_WIDTH = 80;
const TEXT_BOX_HEIGHT = 20;
const TEXT_BOX_OFFSET_X = 20; // Offset to the right of the activation bar

interface ActivationBarProps {
  activation: Activation;
  lifeline: Lifeline;
  isActive: boolean;
  text?: string;
  onClick: () => void;
  onTextChange?: (text: string | undefined) => void;
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
  text,
  onClick,
  onTextChange,
}: ActivationBarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(text || '');
  const inputRef = useRef<HTMLInputElement>(null);

  const x = getLifelineX(lifeline) - ACTIVATION_WIDTH / 2;
  const startY = getMessageY(activation.startMessageOrder);
  const endY = getMessageY(activation.endMessageOrder);
  const height = Math.max(endY - startY, 20);
  const midY = startY + height / 2;

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

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

  const handleTextDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isActive) {
      setIsEditing(true);
      setEditText(text || '');
    }
  };

  const handleTextBlur = () => {
    setIsEditing(false);
    const trimmedText = editText.trim();
    if (trimmedText !== (text || '') && onTextChange) {
      onTextChange(trimmedText || undefined);
    }
  };

  const handleTextKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === 'Enter') {
      handleTextBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditText(text || '');
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
      {/* Text label for active blocks (shown to the right of the activation bar) */}
      {isActive && (
        <g 
          onDoubleClick={handleTextDoubleClick}
          onClick={(e) => e.stopPropagation()}
        >
          <rect
            x={x + ACTIVATION_WIDTH + TEXT_BOX_OFFSET_X}
            y={midY - TEXT_BOX_HEIGHT / 2}
            width={TEXT_BOX_WIDTH}
            height={TEXT_BOX_HEIGHT}
            fill="white"
            rx={4}
            className="cursor-pointer"
            opacity={text || isEditing ? 1 : 0.7}
          />
          {isEditing ? (
            <foreignObject
              x={x + ACTIVATION_WIDTH + TEXT_BOX_OFFSET_X}
              y={midY - TEXT_BOX_HEIGHT / 2}
              width={TEXT_BOX_WIDTH}
              height={TEXT_BOX_HEIGHT}
            >
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <input
                  ref={inputRef}
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  onBlur={handleTextBlur}
                  onKeyDown={handleTextKeyDown}
                  placeholder="Add text..."
                  style={{
                    width: '100%',
                    height: '100%',
                    textAlign: 'center',
                    fontSize: '11px',
                    fontWeight: 500,
                    color: '#374151',
                    backgroundColor: 'white',
                    outline: 'none',
                    border: '1px solid #3B82F6',
                    borderRadius: '4px',
                    padding: '0 4px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </foreignObject>
          ) : (
            <text
              x={x + ACTIVATION_WIDTH + TEXT_BOX_OFFSET_X + TEXT_BOX_WIDTH / 2}
              y={midY + 4}
              textAnchor="middle"
              className="text-xs font-medium fill-gray-600 cursor-pointer select-none"
              style={{ fontSize: '11px' }}
            >
              {text || 'Double-click'}
            </text>
          )}
        </g>
      )}
    </g>
  );
}
