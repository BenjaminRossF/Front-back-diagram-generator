'use client';

import { DEFAULT_COLORS, MessageType } from '@/types/diagram';

interface SequenceToolbarProps {
  diagramName: string;
  onDiagramNameChange: (name: string) => void;
  onAddLifeline: (color: string) => void;
  isAddMessageMode: boolean;
  messageType: MessageType;
  onToggleAddMessageMode: (type: MessageType) => void;
  addMessageModeMessage: string;
  isAddGroupMode: boolean;
  onToggleAddGroupMode: () => void;
  addGroupModeMessage: string;
  onClearAll: () => void;
  onSave: () => void;
  onLoad: () => void;
  onExportPDF: () => void;
}

export default function SequenceToolbar({
  diagramName,
  onDiagramNameChange,
  onAddLifeline,
  isAddMessageMode,
  messageType,
  onToggleAddMessageMode,
  addMessageModeMessage,
  isAddGroupMode,
  onToggleAddGroupMode,
  addGroupModeMessage,
  onClearAll,
  onSave,
  onLoad,
  onExportPDF,
}: SequenceToolbarProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-4 mb-4 flex flex-wrap items-center gap-4">
      {/* Diagram Name Input */}
      <div className="flex items-center gap-2">
        <label htmlFor="diagram-name" className="text-gray-700 font-medium">Name:</label>
        <input
          id="diagram-name"
          type="text"
          value={diagramName}
          onChange={(e) => onDiagramNameChange(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-40"
          placeholder="Diagram name"
          title="Enter diagram name (used for save/export filename)"
        />
      </div>
      
      <div className="h-8 w-px bg-gray-300" />
      
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

      {/* Add Group */}
      <div className="flex items-center gap-2">
        <button
          className={`px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
            isAddGroupMode
              ? 'bg-teal-600 text-white hover:bg-teal-700'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
          onClick={onToggleAddGroupMode}
          title="Create a group by selecting adjacent actors"
        >
          <svg className="w-5 h-4" viewBox="0 0 24 16" fill="none">
            <rect x="2" y="2" width="20" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray={isAddGroupMode ? "0" : "4,2"} />
            <rect x="6" y="5" width="5" height="6" rx="1" fill="currentColor" opacity="0.5" />
            <rect x="13" y="5" width="5" height="6" rx="1" fill="currentColor" opacity="0.5" />
          </svg>
          Group
        </button>
      </div>

      {isAddGroupMode && (
        <span className="text-teal-600 font-medium text-sm">
          {addGroupModeMessage}
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

      <div className="h-8 w-px bg-gray-300" />

      {/* Save/Load */}
      <div className="flex items-center gap-2">
        <button
          className="px-3 py-2 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors flex items-center gap-2"
          onClick={onSave}
          title="Save diagram to .buml file"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
          Save
        </button>
        
        <button
          className="px-3 py-2 rounded-lg font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors flex items-center gap-2"
          onClick={onLoad}
          title="Load diagram from .buml file"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 15v4c0 1.1.9 2 2 2h14a2 2 0 002-2v-4M17 8l-5-5-5 5M12 3v12" />
          </svg>
          Load
        </button>
      </div>

      <div className="h-8 w-px bg-gray-300" />

      {/* Export */}
      <button
        className="px-3 py-2 rounded-lg font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors flex items-center gap-2"
        onClick={onExportPDF}
        title="Export diagram as image"
      >
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10,9 9,9 8,9" />
        </svg>
        Export
      </button>
    </div>
  );
}
