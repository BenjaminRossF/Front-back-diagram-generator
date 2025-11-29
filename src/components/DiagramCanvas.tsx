'use client';

import { useState, useCallback } from 'react';
import {
  Entity,
  Connection,
  DEFAULT_COLORS,
  DEFAULT_ENTITY_WIDTH,
  DEFAULT_ENTITY_HEIGHT,
} from '@/types/diagram';
import EntityBox from './EntityBox';
import ConnectionArrow from './ConnectionArrow';
import Toolbar from './Toolbar';

function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

const INITIAL_ENTITIES: Entity[] = [
  {
    id: generateId(),
    name: 'Frontend',
    color: DEFAULT_COLORS[0],
    x: 100,
    y: 200,
    width: DEFAULT_ENTITY_WIDTH,
    height: DEFAULT_ENTITY_HEIGHT,
  },
  {
    id: generateId(),
    name: 'Backend',
    color: DEFAULT_COLORS[1],
    x: 400,
    y: 200,
    width: DEFAULT_ENTITY_WIDTH,
    height: DEFAULT_ENTITY_HEIGHT,
  },
  {
    id: generateId(),
    name: 'Database',
    color: DEFAULT_COLORS[2],
    x: 700,
    y: 200,
    width: DEFAULT_ENTITY_WIDTH,
    height: DEFAULT_ENTITY_HEIGHT,
  },
];

export default function DiagramCanvas() {
  const [entities, setEntities] = useState<Entity[]>(INITIAL_ENTITIES);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isConnectMode, setIsConnectMode] = useState(false);
  const [connectFromEntity, setConnectFromEntity] = useState<string | null>(null);

  const handleAddEntity = useCallback((color: string) => {
    const newEntity: Entity = {
      id: generateId(),
      name: 'New Entity',
      color,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      width: DEFAULT_ENTITY_WIDTH,
      height: DEFAULT_ENTITY_HEIGHT,
    };
    setEntities((prev) => [...prev, newEntity]);
  }, []);

  const handleSelectEntity = useCallback(
    (id: string) => {
      if (isConnectMode) {
        if (!connectFromEntity) {
          setConnectFromEntity(id);
        } else if (connectFromEntity !== id) {
          // Create connection
          const newConnection: Connection = {
            id: generateId(),
            fromEntityId: connectFromEntity,
            toEntityId: id,
            label: 'Request',
            color: '#6B7280',
          };
          setConnections((prev) => [...prev, newConnection]);
          setConnectFromEntity(null);
          setIsConnectMode(false);
        }
      } else {
        setSelectedEntityId(id);
        setSelectedConnectionId(null);
      }
    },
    [isConnectMode, connectFromEntity]
  );

  const handleUpdateEntity = useCallback((updatedEntity: Entity) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === updatedEntity.id ? updatedEntity : e))
    );
  }, []);

  const handleDeleteEntity = useCallback((id: string) => {
    setEntities((prev) => prev.filter((e) => e.id !== id));
    setConnections((prev) =>
      prev.filter((c) => c.fromEntityId !== id && c.toEntityId !== id)
    );
    setSelectedEntityId(null);
  }, []);

  const handleDragEntity = useCallback((id: string, x: number, y: number) => {
    setEntities((prev) =>
      prev.map((e) => (e.id === id ? { ...e, x, y } : e))
    );
  }, []);

  const handleSelectConnection = useCallback((id: string) => {
    setSelectedConnectionId(id);
    setSelectedEntityId(null);
  }, []);

  const handleUpdateConnection = useCallback((updatedConnection: Connection) => {
    setConnections((prev) =>
      prev.map((c) => (c.id === updatedConnection.id ? updatedConnection : c))
    );
  }, []);

  const handleDeleteConnection = useCallback((id: string) => {
    setConnections((prev) => prev.filter((c) => c.id !== id));
    setSelectedConnectionId(null);
  }, []);

  const handleCanvasClick = useCallback(() => {
    setSelectedEntityId(null);
    setSelectedConnectionId(null);
    if (isConnectMode && connectFromEntity) {
      setConnectFromEntity(null);
    }
  }, [isConnectMode, connectFromEntity]);

  const handleToggleConnectMode = useCallback(() => {
    setIsConnectMode((prev) => !prev);
    setConnectFromEntity(null);
    setSelectedEntityId(null);
    setSelectedConnectionId(null);
  }, []);

  const handleClearAll = useCallback(() => {
    setEntities([]);
    setConnections([]);
    setSelectedEntityId(null);
    setSelectedConnectionId(null);
    setIsConnectMode(false);
    setConnectFromEntity(null);
  }, []);

  const getConnectModeMessage = () => {
    if (!isConnectMode) return '';
    if (!connectFromEntity) return 'Click on the source entity';
    const fromEntity = entities.find((e) => e.id === connectFromEntity);
    return `From "${fromEntity?.name}" - Click on destination entity`;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 p-6">
      <Toolbar
        onAddEntity={handleAddEntity}
        isConnectMode={isConnectMode}
        onToggleConnectMode={handleToggleConnectMode}
        connectModeMessage={getConnectModeMessage()}
        onClearAll={handleClearAll}
      />
      <div
        className="flex-1 relative bg-white/50 backdrop-blur-sm rounded-2xl shadow-inner overflow-hidden border border-white/80"
        onClick={handleCanvasClick}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(to right, #e5e7eb 1px, transparent 1px),
              linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />
        
        {/* Connections SVG layer */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <g className="pointer-events-auto">
            {connections.map((connection) => (
              <ConnectionArrow
                key={connection.id}
                connection={connection}
                entities={entities}
                isSelected={selectedConnectionId === connection.id}
                onSelect={handleSelectConnection}
                onUpdate={handleUpdateConnection}
                onDelete={handleDeleteConnection}
              />
            ))}
          </g>
        </svg>

        {/* Entities layer */}
        {entities.map((entity) => (
          <EntityBox
            key={entity.id}
            entity={entity}
            isSelected={selectedEntityId === entity.id || connectFromEntity === entity.id}
            onSelect={handleSelectEntity}
            onUpdate={handleUpdateEntity}
            onDelete={handleDeleteEntity}
            onDragStart={() => {}}
            onDrag={handleDragEntity}
            onDragEnd={() => {}}
          />
        ))}

        {/* Instructions overlay */}
        {entities.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <p className="text-xl font-medium mb-2">No entities yet</p>
              <p className="text-sm">Click a color button above to add an entity</p>
            </div>
          </div>
        )}
      </div>

      {/* Help text */}
      <div className="mt-4 text-center text-gray-600 text-sm">
        <span className="font-medium">Tips:</span> Drag entities to move them • Double-click to rename • Select and click × to delete • Use &quot;Connect Entities&quot; to draw arrows
      </div>
    </div>
  );
}
