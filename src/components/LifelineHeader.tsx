'use client';

import { Lifeline, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT } from '@/types/diagram';
import { useState, useRef, useEffect } from 'react';

// Move button positioning constants
const MOVE_BUTTON_OFFSET = 15; // Distance from header edge to button center
const MOVE_BUTTON_RADIUS = 12; // Circle radius for move buttons
const ARROW_SIZE = 5; // Size of the triangle arrow

interface LifelineHeaderProps {
  lifeline: Lifeline;
  x: number;
  y: number;
  isSelected: boolean;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  onSelect: (id: string) => void;
  onUpdate: (lifeline: Lifeline) => void;
  onDelete: (id: string) => void;
  onMoveLeft: (id: string) => void;
  onMoveRight: (id: string) => void;
}

export default function LifelineHeader({
  lifeline,
  x,
  y,
  isSelected,
  canMoveLeft,
  canMoveRight,
  onSelect,
  onUpdate,
  onDelete,
  onMoveLeft,
  onMoveRight,
}: LifelineHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(lifeline.name);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(lifeline.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(lifeline.name);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editName.trim() !== lifeline.name) {
      onUpdate({ ...lifeline, name: editName.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(lifeline.name);
    }
  };

  return (
    <g onClick={handleClick} onDoubleClick={handleDoubleClick}>
      {/* Header box */}
      <rect
        x={x}
        y={y}
        width={LIFELINE_HEADER_WIDTH}
        height={LIFELINE_HEADER_HEIGHT}
        rx={8}
        fill={lifeline.color}
        className={`cursor-pointer transition-all ${
          isSelected ? 'stroke-white stroke-[3]' : ''
        }`}
        filter={isSelected ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))'}
      />
      
      {/* Label */}
      {isEditing ? (
        <foreignObject
          x={x + 5}
          y={y + (LIFELINE_HEADER_HEIGHT - 24) / 2}
          width={LIFELINE_HEADER_WIDTH - 10}
          height={24}
        >
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full text-center text-sm font-semibold bg-white/90 text-gray-800 outline-none border-2 border-blue-500 rounded"
            onClick={(e) => e.stopPropagation()}
          />
        </foreignObject>
      ) : (
        <text
          x={x + LIFELINE_HEADER_WIDTH / 2}
          y={y + LIFELINE_HEADER_HEIGHT / 2 + 5}
          textAnchor="middle"
          className="text-sm font-semibold fill-white select-none pointer-events-none"
        >
          {lifeline.name}
        </text>
      )}

      {/* Delete button when selected */}
      {isSelected && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onDelete(lifeline.id);
          }}
          className="cursor-pointer"
        >
          <circle
            cx={x + LIFELINE_HEADER_WIDTH - 8}
            cy={y + 8}
            r={10}
            fill="#EF4444"
          />
          <text
            x={x + LIFELINE_HEADER_WIDTH - 8}
            y={y + 12}
            textAnchor="middle"
            className="text-xs font-bold fill-white select-none"
          >
            ×
          </text>
        </g>
      )}

      {/* Move left button (triangle pointing left) */}
      {isSelected && canMoveLeft && (() => {
        const centerX = x - MOVE_BUTTON_OFFSET;
        const centerY = y + LIFELINE_HEADER_HEIGHT / 2;
        return (
          <g
            onClick={(e) => {
              e.stopPropagation();
              onMoveLeft(lifeline.id);
            }}
            className="cursor-pointer"
          >
            <circle
              cx={centerX}
              cy={centerY}
              r={MOVE_BUTTON_RADIUS}
              fill="#6366F1"
              className="hover:fill-indigo-600"
            />
            <polygon
              points={`${centerX - ARROW_SIZE + 1},${centerY} ${centerX + ARROW_SIZE - 1},${centerY - ARROW_SIZE} ${centerX + ARROW_SIZE - 1},${centerY + ARROW_SIZE}`}
              fill="white"
            />
          </g>
        );
      })()}

      {/* Move right button (triangle pointing right) */}
      {isSelected && canMoveRight && (() => {
        const centerX = x + LIFELINE_HEADER_WIDTH + MOVE_BUTTON_OFFSET;
        const centerY = y + LIFELINE_HEADER_HEIGHT / 2;
        return (
          <g
            onClick={(e) => {
              e.stopPropagation();
              onMoveRight(lifeline.id);
            }}
            className="cursor-pointer"
          >
            <circle
              cx={centerX}
              cy={centerY}
              r={MOVE_BUTTON_RADIUS}
              fill="#6366F1"
              className="hover:fill-indigo-600"
            />
            <polygon
              points={`${centerX + ARROW_SIZE - 1},${centerY} ${centerX - ARROW_SIZE + 1},${centerY - ARROW_SIZE} ${centerX - ARROW_SIZE + 1},${centerY + ARROW_SIZE}`}
              fill="white"
            />
          </g>
        );
      })()}
    </g>
  );
}
