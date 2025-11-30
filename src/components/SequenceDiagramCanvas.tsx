'use client';

import { useState, useCallback } from 'react';
import {
  Lifeline,
  Message,
  Activation,
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

export default function SequenceDiagramCanvas() {
  const [lifelines, setLifelines] = useState<Lifeline[]>(INITIAL_LIFELINES);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activations, setActivations] = useState<Activation[]>([]);
  const [selectedLifelineId, setSelectedLifelineId] = useState<string | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null);
  const [selectedActivationId, setSelectedActivationId] = useState<string | null>(null);
  const [isAddMessageMode, setIsAddMessageMode] = useState(false);
  const [messageFromLifeline, setMessageFromLifeline] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'sync' | 'return'>('sync');

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
        setSelectedActivationId(null);
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
    setActivations((prev) => prev.filter((a) => a.lifelineId !== id));
    setSelectedLifelineId(null);
  }, []);

  // Select message
  const handleSelectMessage = useCallback((id: string) => {
    setSelectedMessageId(id);
    setSelectedLifelineId(null);
    setSelectedActivationId(null);
  }, []);

  // Update message
  const handleUpdateMessage = useCallback((updated: Message) => {
    setMessages((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
  }, []);

  // Delete message
  const handleDeleteMessage = useCallback((id: string) => {
    const deletedMessage = messages.find((m) => m.id === id);
    setMessages((prev) => {
      const filtered = prev.filter((m) => m.id !== id);
      // Reorder remaining messages
      return filtered.map((m, i) => ({ ...m, order: i }));
    });
    // Update activations that reference this message
    if (deletedMessage) {
      setActivations((prev) =>
        prev.map((a) => {
          if (a.startMessageOrder === deletedMessage.order || a.endMessageOrder === deletedMessage.order) {
            return a; // Will be cleaned up separately
          }
          // Adjust orders for messages after the deleted one
          return {
            ...a,
            startMessageOrder: a.startMessageOrder > deletedMessage.order ? a.startMessageOrder - 1 : a.startMessageOrder,
            endMessageOrder: a.endMessageOrder > deletedMessage.order ? a.endMessageOrder - 1 : a.endMessageOrder,
          };
        }).filter((a) => a.startMessageOrder >= 0 && a.endMessageOrder >= 0)
      );
    }
    setSelectedMessageId(null);
  }, [messages]);

  // Select activation
  const handleSelectActivation = useCallback((id: string) => {
    setSelectedActivationId(id);
    setSelectedLifelineId(null);
    setSelectedMessageId(null);
  }, []);

  // Delete activation
  const handleDeleteActivation = useCallback((id: string) => {
    setActivations((prev) => prev.filter((a) => a.id !== id));
    setSelectedActivationId(null);
  }, []);

  // Add activation
  const handleAddActivation = useCallback(() => {
    if (!selectedLifelineId || messages.length === 0) return;
    
    // Find available message range
    const newActivation: Activation = {
      id: generateId('activation'),
      lifelineId: selectedLifelineId,
      startMessageOrder: 0,
      endMessageOrder: messages.length - 1,
    };
    setActivations((prev) => [...prev, newActivation]);
  }, [selectedLifelineId, messages.length]);

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
    setSelectedActivationId(null);
  }, [isAddMessageMode, messageType]);

  // Canvas click handler
  const handleCanvasClick = useCallback(() => {
    setSelectedLifelineId(null);
    setSelectedMessageId(null);
    setSelectedActivationId(null);
    if (isAddMessageMode && messageFromLifeline) {
      setMessageFromLifeline(null);
    }
  }, [isAddMessageMode, messageFromLifeline]);

  // Clear all
  const handleClearAll = useCallback(() => {
    setLifelines([]);
    setMessages([]);
    setActivations([]);
    setSelectedLifelineId(null);
    setSelectedMessageId(null);
    setSelectedActivationId(null);
    setIsAddMessageMode(false);
    setMessageFromLifeline(null);
  }, []);

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
      <SequenceToolbar
        onAddLifeline={handleAddLifeline}
        isAddMessageMode={isAddMessageMode}
        messageType={messageType}
        onToggleAddMessageMode={handleToggleAddMessageMode}
        addMessageModeMessage={getAddMessageModeMessage()}
        onAddActivation={handleAddActivation}
        canAddActivation={!!selectedLifelineId && messages.length > 0}
        onClearAll={handleClearAll}
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

          {/* Activation bars */}
          {activations.map((activation) => {
            const lifeline = lifelines.find((l) => l.id === activation.lifelineId);
            if (!lifeline) return null;
            return (
              <ActivationBar
                key={activation.id}
                activation={activation}
                lifeline={lifeline}
                isSelected={selectedActivationId === activation.id}
                onSelect={handleSelectActivation}
                onDelete={handleDeleteActivation}
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
              onSelect={handleSelectLifeline}
              onUpdate={handleUpdateLifeline}
              onDelete={handleDeleteLifeline}
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
        <span className="font-medium">Tips:</span> Double-click actors to rename • Use &quot;Add Message&quot; buttons to draw arrows • Select an actor and click &quot;Add Activation&quot; to show processing time
      </div>
    </div>
  );
}
