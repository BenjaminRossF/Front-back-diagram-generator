export interface Entity {
  id: string;
  name: string;
  color: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Connection {
  id: string;
  fromEntityId: string;
  toEntityId: string;
  label: string;
  color: string;
}

export interface DiagramState {
  entities: Entity[];
  connections: Connection[];
}

export const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Violet
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#6366F1', // Indigo
];

export const DEFAULT_ENTITY_WIDTH = 180;
export const DEFAULT_ENTITY_HEIGHT = 80;
