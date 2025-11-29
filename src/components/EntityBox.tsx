'use client';

import { Entity } from '@/types/diagram';
import { useState, useRef, useEffect } from 'react';

interface EntityBoxProps {
  entity: Entity;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onUpdate: (entity: Entity) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string, startX: number, startY: number) => void;
  onDrag: (id: string, x: number, y: number) => void;
  onDragEnd: () => void;
}

export default function EntityBox({
  entity,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onDragStart,
  onDrag,
  onDragEnd,
}: EntityBoxProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(entity.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    e.preventDefault();
    isDragging.current = true;
    dragOffset.current = {
      x: e.clientX - entity.x,
      y: e.clientY - entity.y,
    };
    onSelect(entity.id);
    onDragStart(entity.id, e.clientX, e.clientY);

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!isDragging.current) return;
      const newX = moveEvent.clientX - dragOffset.current.x;
      const newY = moveEvent.clientY - dragOffset.current.y;
      onDrag(entity.id, newX, newY);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      onDragEnd();
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleDoubleClick = () => {
    setIsEditing(true);
    setEditName(entity.name);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditName(e.target.value);
  };

  const handleNameBlur = () => {
    setIsEditing(false);
    if (editName.trim() !== entity.name) {
      onUpdate({ ...entity, name: editName.trim() });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setEditName(entity.name);
    }
  };

  return (
    <div
      className={`absolute cursor-move rounded-xl shadow-lg transition-shadow duration-200 flex items-center justify-center ${
        isSelected ? 'ring-4 ring-white/50 shadow-2xl' : 'hover:shadow-xl'
      }`}
      style={{
        left: entity.x,
        top: entity.y,
        width: entity.width,
        height: entity.height,
        backgroundColor: entity.color,
      }}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
    >
      {isSelected && (
        <button
          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-sm font-bold hover:bg-red-600 transition-colors flex items-center justify-center shadow-md"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(entity.id);
          }}
        >
          ×
        </button>
      )}
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={editName}
          onChange={handleNameChange}
          onBlur={handleNameBlur}
          onKeyDown={handleKeyDown}
          className="bg-transparent text-white text-center text-lg font-semibold w-full px-2 outline-none"
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="text-white text-lg font-semibold select-none px-4 text-center">
          {entity.name}
        </span>
      )}
    </div>
  );
}
