'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Group,
  Lifeline,
  DEFAULT_GROUP_COLORS,
} from '@/types/diagram';
import { calculateGroupBounds, GROUP_HEADER_HEIGHT, GROUP_BORDER_RADIUS } from '@/lib/groupUtils';

interface GroupBoxProps {
  group: Group;
  lifelines: Lifeline[];
  canvasHeight: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (group: Group) => void;
  onDelete: (id: string) => void;
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
            aria-label="Edit group name"
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              e.stopPropagation();
              onDelete(group.id);
            }
          }}
          tabIndex={0}
          role="button"
          aria-label={`Delete group ${group.name}`}
          className="cursor-pointer focus:outline-none"
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
            role="group"
            aria-label="Group color options"
          >
            {DEFAULT_GROUP_COLORS.map((color, index) => {
              const colorNames = ['Light Blue', 'Light Emerald', 'Light Amber', 'Light Red', 'Light Violet', 'Light Pink', 'Light Teal', 'Light Indigo'];
              return (
                <button
                  key={color}
                  onClick={() => handleColorChange(color)}
                  aria-label={`Change group color to ${colorNames[index]}`}
                  aria-pressed={color === group.color}
                  style={{
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: color === group.color ? '2px solid #374151' : '1px solid #9CA3AF',
                    cursor: 'pointer',
                  }}
                  title={`Change to ${colorNames[index]}`}
                />
              );
            })}
          </div>
        </foreignObject>
      )}
    </g>
  );
}
