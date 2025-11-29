'use client';

import { Connection, Entity } from '@/types/diagram';
import { useState, useRef, useEffect } from 'react';

interface ConnectionArrowProps {
  connection: Connection;
  entities: Entity[];
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (connection: Connection) => void;
  onDelete: (id: string) => void;
}

function getEntityCenter(entity: Entity): { x: number; y: number } {
  return {
    x: entity.x + entity.width / 2,
    y: entity.y + entity.height / 2,
  };
}

function getConnectionPoints(fromEntity: Entity, toEntity: Entity): {
  start: { x: number; y: number };
  end: { x: number; y: number };
} {
  const fromCenter = getEntityCenter(fromEntity);
  const toCenter = getEntityCenter(toEntity);

  // Calculate angle between centers
  const angle = Math.atan2(toCenter.y - fromCenter.y, toCenter.x - fromCenter.x);

  // Calculate intersection with entity edges
  const start = {
    x: fromCenter.x + (fromEntity.width / 2) * Math.cos(angle),
    y: fromCenter.y + (fromEntity.height / 2) * Math.sin(angle),
  };

  const end = {
    x: toCenter.x - (toEntity.width / 2) * Math.cos(angle),
    y: toCenter.y - (toEntity.height / 2) * Math.sin(angle),
  };

  return { start, end };
}

export default function ConnectionArrow({
  connection,
  entities,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
}: ConnectionArrowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(connection.label);
  const inputRef = useRef<HTMLInputElement>(null);

  const fromEntity = entities.find((e) => e.id === connection.fromEntityId);
  const toEntity = entities.find((e) => e.id === connection.toEntityId);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (!fromEntity || !toEntity) return null;

  const { start, end } = getConnectionPoints(fromEntity, toEntity);

  // Calculate midpoint for label
  const midX = (start.x + end.x) / 2;
  const midY = (start.y + end.y) / 2;

  // Calculate angle for arrowhead
  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const arrowLength = 15;
  const arrowWidth = Math.PI / 6;

  const arrowPoint1 = {
    x: end.x - arrowLength * Math.cos(angle - arrowWidth),
    y: end.y - arrowLength * Math.sin(angle - arrowWidth),
  };

  const arrowPoint2 = {
    x: end.x - arrowLength * Math.cos(angle + arrowWidth),
    y: end.y - arrowLength * Math.sin(angle + arrowWidth),
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(connection.id);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditLabel(connection.label);
  };

  const handleLabelBlur = () => {
    setIsEditing(false);
    if (editLabel !== connection.label) {
      onUpdate({ ...connection, label: editLabel });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLabelBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditLabel(connection.label);
    }
  };

  return (
    <g onClick={handleClick}>
      {/* Line */}
      <line
        x1={start.x}
        y1={start.y}
        x2={end.x}
        y2={end.y}
        stroke={connection.color}
        strokeWidth={isSelected ? 4 : 3}
        className="cursor-pointer"
      />
      {/* Arrowhead */}
      <polygon
        points={`${end.x},${end.y} ${arrowPoint1.x},${arrowPoint1.y} ${arrowPoint2.x},${arrowPoint2.y}`}
        fill={connection.color}
      />
      {/* Label background */}
      {connection.label && (
        <>
          <rect
            x={midX - 50}
            y={midY - 15}
            width={100}
            height={30}
            fill="white"
            rx={6}
            className="cursor-pointer"
            onDoubleClick={handleDoubleClick}
          />
          {isEditing ? (
            <foreignObject x={midX - 50} y={midY - 15} width={100} height={30}>
              <input
                ref={inputRef}
                type="text"
                value={editLabel}
                onChange={(e) => setEditLabel(e.target.value)}
                onBlur={handleLabelBlur}
                onKeyDown={handleKeyDown}
                className="w-full h-full text-center text-sm font-medium text-gray-700 bg-transparent outline-none border-2 border-blue-500 rounded-md"
                onClick={(e) => e.stopPropagation()}
              />
            </foreignObject>
          ) : (
            <text
              x={midX}
              y={midY + 5}
              textAnchor="middle"
              className="text-sm font-medium fill-gray-700 cursor-pointer select-none"
              onDoubleClick={handleDoubleClick}
            >
              {connection.label}
            </text>
          )}
        </>
      )}
      {/* Delete button when selected */}
      {isSelected && (
        <g
          onClick={(e) => {
            e.stopPropagation();
            onDelete(connection.id);
          }}
          className="cursor-pointer"
        >
          <circle cx={midX + 60} cy={midY} r={12} fill="#EF4444" />
          <text
            x={midX + 60}
            y={midY + 5}
            textAnchor="middle"
            className="text-sm font-bold fill-white select-none"
          >
            ×
          </text>
        </g>
      )}
    </g>
  );
}
