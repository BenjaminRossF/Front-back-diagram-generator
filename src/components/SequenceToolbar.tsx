'use client';

import { DEFAULT_COLORS, MessageType } from '@/types/diagram';

interface SequenceToolbarProps {
  onAddLifeline: (color: string) => void;
  isAddMessageMode: boolean;
  messageType: MessageType;
  onToggleAddMessageMode: (type: MessageType) => void;
  addMessageModeMessage: string;
  onClearAll: () => void;
}

export default function SequenceToolbar({
  onAddLifeline,
  isAddMessageMode,
  messageType,
  onToggleAddMessageMode,
  addMessageModeMessage,
  onClearAll,
}: SequenceToolbarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-4 flex flex-wrap items-center gap-4">
      {/* Add Actor/Lifeline */}
      <div className="flex items-center gap-2">
        <span className="text-gray-700 font-medium">Add Actor:</span>
        <div className="flex gap-2">
          {DEFAULT_COLORS.map((color) => (
            <button
              key={color}
              className="w-8 h-8 rounded-full shadow-md hover:scale-110 transition-transform border-2 border-white hover:border-gray-200"
              style={{ backgroundColor: color }}
              onClick={() => onAddLifeline(color)}
              title="Add actor with this color"
            />
          ))}
        </div>
      </div>
      
      <div className="h-8 w-px bg-gray-300" />
      
      {/* Add Messages */}
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isAddMessageMode && messageType === 'sync'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => onToggleAddMessageMode('sync')}
          title="Add synchronous request message (solid arrow)"
        >
          <svg className="w-5 h-4" viewBox="0 0 24 16" fill="none">
            <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="2" />
            <polygon points="22,8 16,4 16,12" fill="currentColor" />
          </svg>
          Request
        </button>
        
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isAddMessageMode && messageType === 'return'
              ? 'bg-violet-600 text-white hover:bg-violet-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={() => onToggleAddMessageMode('return')}
          title="Add return/reply message (dashed arrow)"
        >
          <svg className="w-5 h-4" viewBox="0 0 24 16" fill="none">
            <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="2" strokeDasharray="4,2" />
            <polyline points="6,4 2,8 6,12" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          Return
        </button>
      </div>
      
      {isAddMessageMode && (
        <span className="text-violet-600 font-medium text-sm">
          {addMessageModeMessage}
        </span>
      )}
      
      <div className="h-8 w-px bg-gray-300" />
      
      {/* Clear All */}
      <button
        className="px-4 py-2 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
        onClick={onClearAll}
      >
        Clear All
      </button>
    </div>
  );
}
