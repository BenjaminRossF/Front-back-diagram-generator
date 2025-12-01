'use client';

import { useState, useCallback, useMemo, useRef } from 'react';
import {
  Lifeline,
  Message,
  DEFAULT_COLORS,
  LIFELINE_HEADER_WIDTH,
  LIFELINE_HEADER_HEIGHT,
  LIFELINE_SPACING,
  LIFELINE_START_X,
  LIFELINE_START_Y,
  MESSAGE_SPACING,
} from '@/types/diagram';
import LifelineHeader from './LifelineHeader';
import MessageArrow from './MessageArrow';
import ActivationBar from './ActivationBar';
import SequenceToolbar from './SequenceToolbar';
import { serializeToBuml, buildDiagramFromBuml } from '@/lib/BumlBuilder';
import { ExportFactory } from '@/lib/ExportFactory';

let idCounter = 0;

function generateId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${Date.now()}-${idCounter}-${Math.random().toString(36).substring(2, 9)}`;
}

const INITIAL_LIFELINES: Lifeline[] = [
  { id: generateId('lifeline'), name: 'Front', color: DEFAULT_COLORS[0], order: 0 },
  { id: generateId('lifeline'), name: 'Back', color: DEFAULT_COLORS[1], order: 1 },
  { id: generateId('lifeline'), name: 'AI', color: DEFAULT_COLORS[4], order: 2 },
];

// Represents a block between two consecutive messages on a lifeline
interface ActivationBlock {
  lifelineId: string;
  startMessageOrder: number;
  endMessageOrder: number;
}

// Generate a unique key for an activation block
function getBlockKey(block: ActivationBlock): string {
  return `${block.lifelineId}-${block.startMessageOrder}-${block.endMessageOrder}`;
}

export default function SequenceDiagramCanvas() {
  const [lifelines, setLifelines] = useState<Lifeline[]>(INITIAL_LIFELINES);
  const [messages, setMessages] = useState<Message[]>([]);
  // Track which blocks are activated using a Set of block keys
  const [activatedBlocks, setActivatedBlocks] = useState<Set<string>>(new Set());
  const [selectedLifelineId, setSelectedLifelineId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [isAddMessageMode, setIsAddMessageMode] = useState(false);
  const [messageFromLifeline, setMessageFromLifeline] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'sync' | 'return'>('sync');
  
  // File input ref for loading .buml files
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Diagram name state
  const [diagramName, setDiagramName] = useState<string>('Untitled Diagram');
  
  // Notification state for user feedback
  const [notification, setNotification] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // Show notification helper
  const showNotification = useCallback((message: string, type: 'error' | 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  }, []);

  // Calculate lifeline X position
  const getLifelineX = useCallback((lifeline: Lifeline) => {
    return LIFELINE_START_X + lifeline.order * LIFELINE_SPACING + LIFELINE_HEADER_WIDTH / 2;
  }, []);

  // Calculate canvas dimensions
  const canvasWidth = Math.max(
    800,
    LIFELINE_START_X + lifelines.length * LIFELINE_SPACING + 100
  );
  const canvasHeight = Math.max(
    600,
    LIFELINE_START_Y + LIFELINE_HEADER_HEIGHT + 50 + (messages.length + 1) * MESSAGE_SPACING + 100
  );

  // Add new lifeline
  const handleAddLifeline = useCallback((color: string) => {
    const newLifeline: Lifeline = {
      id: generateId('lifeline'),
      name: 'Actor',
      color,
      order: lifelines.length,
    };
    setLifelines((prev) => [...prev, newLifeline]);
  }, [lifelines.length]);

  // Select lifeline
  const handleSelectLifeline = useCallback(
    (id: string) => {
      if (isAddMessageMode) {
        if (!messageFromLifeline) {
          setMessageFromLifeline(id);
        } else if (messageFromLifeline !== id) {
          // Create message
          const newMessage: Message = {
            id: generateId('message'),
            fromLifelineId: messageFromLifeline,
            toLifelineId: id,
            label: messageType === 'sync' ? 'request()' : 'response',
            type: messageType,
            order: messages.length,
          };
          setMessages((prev) => [...prev, newMessage]);
          setMessageFromLifeline(null);
          setIsAddMessageMode(false);
        }
      } else {
        setSelectedLifelineId(id);
        setSelectedMessageId(null);
      }
    },
    [isAddMessageMode, messageFromLifeline, messageType, messages.length]
  );

  // Update lifeline
  const handleUpdateLifeline = useCallback((updated: Lifeline) => {
    setLifelines((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }, []);

  // Delete lifeline
  const handleDeleteLifeline = useCallback((id: string) => {
    setLifelines((prev) => {
      const filtered = prev.filter((l) => l.id !== id);
      // Reorder remaining lifelines
      return filtered.map((l, i) => ({ ...l, order: i }));
    });
    setMessages((prev) =>
      prev.filter((m) => m.fromLifelineId !== id && m.toLifelineId !== id)
    );
    // Clean up activated blocks for deleted lifeline using filter
    setActivatedBlocks((prev) => {
      const prefix = id + '-';
      return new Set(Array.from(prev).filter((key) => !key.startsWith(prefix)));
    });
    setSelectedLifelineId(null);
  }, []);

  // Move lifeline left
  const handleMoveLifelineLeft = useCallback((id: string) => {
    setLifelines((prev) => {
      const lifeline = prev.find((l) => l.id === id);
      if (!lifeline || lifeline.order === 0) return prev;
      
      return prev.map((l) => {
        if (l.id === id) {
          return { ...l, order: l.order - 1 };
        }
        if (l.order === lifeline.order - 1) {
          return { ...l, order: l.order + 1 };
        }
        return l;
      });
    });
  }, []);

  // Move lifeline right
  const handleMoveLifelineRight = useCallback((id: string) => {
    setLifelines((prev) => {
      const lifeline = prev.find((l) => l.id === id);
      if (!lifeline || lifeline.order === prev.length - 1) return prev;
      
      return prev.map((l) => {
        if (l.id === id) {
          return { ...l, order: l.order + 1 };
        }
        if (l.order === lifeline.order + 1) {
          return { ...l, order: l.order - 1 };
        }
        return l;
      });
    });
  }, []);

  // Select message
  const handleSelectMessage = useCallback((id: string) => {
    setSelectedMessageId(id);
    setSelectedLifelineId(null);
  }, []);

  // Update message
  const handleUpdateMessage = useCallback((updated: Message) => {
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  // Delete message
  const handleDeleteMessage = useCallback((id: string) => {
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      // Reorder remaining messages
      return filtered.map((m, i) => ({ ...m, order: i }));
    });
    // Clean up activated blocks when message count changes
    // All block keys will be recalculated based on new message orders
    setActivatedBlocks(new Set());
    setSelectedMessageId(null);
  }, []);

  // Compute all possible activation blocks for each lifeline
  // A block exists between any two consecutive messages that touch a lifeline
  const availableBlocks = useMemo((): ActivationBlock[] => {
    const blocks: ActivationBlock[] = [];
    
    // For each lifeline, find messages that touch it
    lifelines.forEach((lifeline) => {
      // Get all messages that touch this lifeline (as source or destination)
      const touchingMessages = messages
        .filter((m) => m.fromLifelineId === lifeline.id || m.toLifelineId === lifeline.id)
        .sort((a, b) => a.order - b.order);
      
      // Create a block between each pair of consecutive touching messages
      for (let i = 0; i < touchingMessages.length - 1; i++) {
        blocks.push({
          lifelineId: lifeline.id,
          startMessageOrder: touchingMessages[i].order,
          endMessageOrder: touchingMessages[i + 1].order,
        });
      }
    });
    
    return blocks;
  }, [lifelines, messages]);

  // Toggle activation for a block
  const handleToggleBlock = useCallback((block: ActivationBlock) => {
    const key = getBlockKey(block);
    setActivatedBlocks((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  }, []);

  // Toggle add message mode
  const handleToggleAddMessageMode = useCallback((type: 'sync' | 'return') => {
    if (isAddMessageMode && messageType === type) {
      setIsAddMessageMode(false);
      setMessageFromLifeline(null);
    } else {
      setIsAddMessageMode(true);
      setMessageType(type);
      setMessageFromLifeline(null);
    }
    setSelectedLifelineId(null);
    setSelectedMessageId(null);
  }, [isAddMessageMode, messageType]);

  // Canvas click handler
  const handleCanvasClick = useCallback(() => {
    setSelectedLifelineId(null);
    setSelectedMessageId(null);
    if (isAddMessageMode && messageFromLifeline) {
      setMessageFromLifeline(null);
    }
  }, [isAddMessageMode, messageFromLifeline]);

  // Clear all
  // Clear all
  const handleClearAll = useCallback(() => {
    setLifelines([]);
    setMessages([]);
    setActivatedBlocks(new Set());
    setDiagramName('Untitled Diagram');
    setSelectedLifelineId(null);
    setSelectedMessageId(null);
    setIsAddMessageMode(false);
    setMessageFromLifeline(null);
  }, []);

  // Save diagram to .buml file
  const handleSave = useCallback(() => {
    const content = serializeToBuml(
      { lifelines, messages, activations: [] },
      activatedBlocks,
      diagramName
    );
    
    // Sanitize filename by removing/replacing invalid characters
    const sanitizedName = diagramName.replace(/[<>:"/\\|?*]/g, '_').trim() || 'diagram';
    
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sanitizedName}.buml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [lifelines, messages, activatedBlocks, diagramName]);

  // Load diagram from .buml file
  const handleLoad = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle file selection
  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const diagram = buildDiagramFromBuml(content);
        
        setLifelines(diagram.state.lifelines);
        setMessages(diagram.state.messages);
        setActivatedBlocks(new Set(diagram.activatedBlocks));
        // Restore the diagram name if available, otherwise use the filename without extension
        const nameFromFile = diagram.name || file.name.replace(/\.buml$/i, '');
        setDiagramName(nameFromFile);
        setSelectedLifelineId(null);
        setSelectedMessageId(null);
        setIsAddMessageMode(false);
        setMessageFromLifeline(null);
        showNotification('Diagram loaded successfully!', 'success');
      } catch (error) {
        showNotification('Failed to load diagram: ' + (error instanceof Error ? error.message : 'Invalid file'), 'error');
      }
    };
    reader.readAsText(file);
    
    // Reset the input so the same file can be loaded again
    event.target.value = '';
  }, [showNotification]);

  // Export diagram as PDF/image
  const handleExportPDF = useCallback(async () => {
    // Sanitize filename by removing/replacing invalid characters
    const sanitizedName = diagramName.replace(/[<>:"/\\|?*]/g, '_').trim() || 'diagram';
    
    const result = await ExportFactory.exportDiagram(
      'pdf',
      { lifelines, messages, activations: [] },
      activatedBlocks,
      sanitizedName
    );
    
    if (!result.success) {
      showNotification('Failed to export diagram: ' + (result.error || 'Unknown error'), 'error');
    } else {
      showNotification('Diagram exported successfully!', 'success');
    }
  }, [lifelines, messages, activatedBlocks, diagramName, showNotification]);

  // Get add message mode status message
  const getAddMessageModeMessage = () => {
    if (!isAddMessageMode) return '';
    const typeLabel = messageType === 'sync' ? 'sync request' : 'return';
    if (!messageFromLifeline) return `Click source lifeline for ${typeLabel}`;
    const fromLifeline = lifelines.find((l) => l.id === messageFromLifeline);
    return `From "${fromLifeline?.name}" - Click destination lifeline`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      {/* Notification toast */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all ${
            notification.type === 'error'
              ? 'bg-red-100 text-red-800 border border-red-200'
              : 'bg-green-100 text-green-800 border border-green-200'
          }`}
        >
          {notification.message}
        </div>
      )}
      
      {/* Hidden file input for loading .buml files */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".buml"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <SequenceToolbar
        diagramName={diagramName}
        onDiagramNameChange={setDiagramName}
        onAddLifeline={handleAddLifeline}
        isAddMessageMode={isAddMessageMode}
        messageType={messageType}
        onToggleAddMessageMode={handleToggleAddMessageMode}
        addMessageModeMessage={getAddMessageModeMessage()}
        onClearAll={handleClearAll}
        onSave={handleSave}
        onLoad={handleLoad}
        onExportPDF={handleExportPDF}
      />
      
      <div
        className="flex-1 relative bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner overflow-auto border border-white/80"
        onClick={handleCanvasClick}
      >
        <svg width={canvasWidth} height={canvasHeight} className="min-w-full min-h-full">
          {/* Grid background */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Lifeline dashed lines */}
          {lifelines.map((lifeline) => {
            const x = getLifelineX(lifeline);
            const startY = LIFELINE_START_Y + LIFELINE_HEADER_HEIGHT;
            const endY = canvasHeight - 40;
            return (
              <line
                key={`line-${lifeline.id}`}
                x1={x}
                y1={startY}
                x2={x}
                y2={endY}
                stroke="#9CA3AF"
                strokeWidth={2}
                strokeDasharray="8,6"
              />
            );
          })}

          {/* Activation blocks (clickable areas between consecutive messages) */}
          {availableBlocks.map((block) => {
            const lifeline = lifelines.find((l) => l.id === block.lifelineId);
            if (!lifeline) return null;
            const key = getBlockKey(block);
            const isActive = activatedBlocks.has(key);
            return (
              <ActivationBar
                key={key}
                activation={{
                  id: key,
                  lifelineId: block.lifelineId,
                  startMessageOrder: block.startMessageOrder,
                  endMessageOrder: block.endMessageOrder,
                }}
                lifeline={lifeline}
                isActive={isActive}
                onClick={() => handleToggleBlock(block)}
              />
            );
          })}

          {/* Messages */}
          {messages.map((message) => (
            <MessageArrow
              key={message.id}
              message={message}
              lifelines={lifelines}
              isSelected={selectedMessageId === message.id}
              onSelect={handleSelectMessage}
              onUpdate={handleUpdateMessage}
              onDelete={handleDeleteMessage}
            />
          ))}

          {/* Lifeline headers */}
          {lifelines.map((lifeline) => (
            <LifelineHeader
              key={lifeline.id}
              lifeline={lifeline}
              x={LIFELINE_START_X + lifeline.order * LIFELINE_SPACING}
              y={LIFELINE_START_Y}
              isSelected={selectedLifelineId === lifeline.id || messageFromLifeline === lifeline.id}
              canMoveLeft={lifeline.order > 0}
              canMoveRight={lifeline.order < lifelines.length - 1}
              onSelect={handleSelectLifeline}
              onUpdate={handleUpdateLifeline}
              onDelete={handleDeleteLifeline}
              onMoveLeft={handleMoveLifelineLeft}
              onMoveRight={handleMoveLifelineRight}
            />
          ))}
        </svg>

        {/* Empty state overlay */}
        {lifelines.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xl font-medium mb-2">No actors yet</p>
              <p className="text-sm">Click a color button above to add an actor/lifeline</p>
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-4 text-center text-gray-600 text-sm">
        <span className="font-medium">Tips:</span> Double-click actors to rename • Use &quot;Add Message&quot; buttons to draw arrows • Click between two arrows to toggle activation • Use arrow buttons to reorder actors
      </div>
    </div>
  );
}
