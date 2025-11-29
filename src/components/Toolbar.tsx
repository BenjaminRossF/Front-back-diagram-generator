'use client';

import { DEFAULT_COLORS } from '@/types/diagram';

interface ToolbarProps {
  onAddEntity: (color: string) => void;
  isConnectMode: boolean;
  onToggleConnectMode: () => void;
  connectModeMessage: string;
  onClearAll: () => void;
}

export default function Toolbar({
  onAddEntity,
  isConnectMode,
  onToggleConnectMode,
  connectModeMessage,
  onClearAll,
}: ToolbarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-4 flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">Add Entity:</span>
        <div className="flex gap-2">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full shadow-md hover:scale-110 transition-transform border-2 border-white hover:border-gray-200"
              style={{ backgroundColor: color }}
              onClick={() => onAddEntity(color)}
              title={`Add entity with this color`}
            />
          ))}
        </div>
      </div>
      <div className="h-8 w-px bg-gray-300" />
      <button
        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
          isConnectMode
            ? 'bg-violet-600 text-white hover:bg-violet-700'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
        onClick={onToggleConnectMode}
      >
        {isConnectMode ? 'Cancel Connection' : 'Connect Entities'}
      </button>
      {isConnectMode && (
        <span className="text-violet-600 font-medium text-sm">
          {connectModeMessage}
        </span>
      )}
      <div className="h-8 w-px bg-gray-300" />
      <button
        className="px-4 py-2 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
        onClick={onClearAll}
      >
        Clear All
      </button>
    </div>
  );
}
