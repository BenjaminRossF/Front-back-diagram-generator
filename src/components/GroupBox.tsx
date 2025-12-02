'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Group,
  Lifeline,
  LIFELINE_HEADER_WIDTH,
  LIFELINE_SPACING,
  LIFELINE_START_X,
  LIFELINE_START_Y,
  DEFAULT_GROUP_COLORS,
} from '@/types/diagram';

// Group box layout constants
const GROUP_PADDING = 20;
const GROUP_HEADER_HEIGHT = 24;
const GROUP_BORDER_RADIUS = 8;

interface GroupBoxProps {
  group: Group;
  lifelines: Lifeline[];
  canvasHeight: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (group: Group) => void;
  onDelete: (id: string) => void;
}

/**
 * Calculate group bounds based on lifelines in the group
 */
function calculateGroupBounds(
  group: Group,
  lifelines: Lifeline[],
  canvasHeight: number
): { x: number; y: number; width: number; height: number } | null {
  const groupLifelines = lifelines.filter((l) => group.lifelineIds.includes(l.id));
  if (groupLifelines.length === 0) return null;

  // Get min and max order positions
  const orders = groupLifelines.map((l) => l.order).sort((a, b) => a - b);
  const minOrder = orders[0];
  const maxOrder = orders[orders.length - 1];

  // Calculate bounds
  const x = LIFELINE_START_X + minOrder * LIFELINE_SPACING - GROUP_PADDING;
  const y = LIFELINE_START_Y - GROUP_HEADER_HEIGHT - GROUP_PADDING / 2;
  const width = (maxOrder - minOrder + 1) * LIFELINE_SPACING - LIFELINE_SPACING + LIFELINE_HEADER_WIDTH + GROUP_PADDING * 2;
  const height = canvasHeight - y - GROUP_PADDING;

  return { x, y, width, height };
}

export default function GroupBox({
  group,
  lifelines,
  canvasHeight,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: GroupBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(group.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const bounds = calculateGroupBounds(group, lifelines, canvasHeight);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!bounds) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(group.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditName(group.name);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editName.trim() !== group.name) {
      onUpdate({ ...group, name: editName.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(group.name);
    }
  };

  const handleColorChange = (newColor: string) => {
    onUpdate({ ...group, color: newColor });
  };

  return (
    <g onClick={handleClick} onDoubleClick={handleDoubleClick}>
      {/* Group background */}
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        rx={GROUP_BORDER_RADIUS}
        fill={group.color}
        opacity={0.5}
        className="cursor-pointer"
      />
      
      {/* Group border */}
      <rect
        x={bounds.x}
        y={bounds.y}
        width={bounds.width}
        height={bounds.height}
        rx={GROUP_BORDER_RADIUS}
        fill="none"
        stroke={group.color}
        strokeWidth={isSelected ? 3 : 2}
        className="cursor-pointer"
      />
      
      {/* Group name */}
      {isEditing ? (
        <foreignObject
          x={bounds.x + 8}
          y={bounds.y + 4}
          width={bounds.width - 50}
          height={GROUP_HEADER_HEIGHT}
        >
          <input
            ref={inputRef}
            type="text"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleNameBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full text-sm font-semibold bg-white/90 text-gray-800 outline-none border-2 border-blue-500 rounded px-2"
            onClick={(e) => e.stopPropagation()}
          />
        </foreignObject>
      ) : (
        <text
          x={bounds.x + 12}
          y={bounds.y + GROUP_HEADER_HEIGHT / 2 + 4}
          className="text-sm font-semibold fill-gray-700 select-none pointer-events-none"
        >
          {group.name || 'Unnamed Group'}
        </text>
      )}

      {/* Delete button when selected */}
      {isSelected && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onDelete(group.id);
          }}
          className="cursor-pointer"
        >
          <circle
            cx={bounds.x + bounds.width - 12}
            cy={bounds.y + 12}
            r={10}
            fill="#EF4444"
          />
          <text
            x={bounds.x + bounds.width - 12}
            y={bounds.y + 16}
            textAnchor="middle"
            className="text-xs font-bold fill-white select-none"
          >
            ×
          </text>
        </g>
      )}

      {/* Color picker when selected */}
      {isSelected && (
        <foreignObject
          x={bounds.x + bounds.width - 180}
          y={bounds.y + 4}
          width={160}
          height={20}
        >
          <div 
            style={{ display: 'flex', gap: '4px', alignItems: 'center' }}
            onClick={(e) => e.stopPropagation()}
          >
            {DEFAULT_GROUP_COLORS.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: color === group.color ? '2px solid #374151' : '1px solid #9CA3AF',
                  cursor: 'pointer',
                }}
                title={`Change to ${color}`}
              />
            ))}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
