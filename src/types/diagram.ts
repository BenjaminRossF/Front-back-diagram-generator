// Lifeline - represents an actor/component (horizontal axis)
export interface Lifeline {
  id: string;
  name: string;
  color: string;
  order: number; // Position from left to right
}

// Message types for sequence diagrams
export type MessageType = 'sync' | 'return';

// Message - horizontal arrow between lifelines
export interface Message {
  id: string;
  fromLifelineId: string;
  toLifelineId: string;
  label: string;
  description?: string; // Optional description text displayed below the arrow
  type: MessageType;
  order: number; // Vertical position (time order)
}

// Activation - shows when a lifeline is active/processing
export interface Activation {
  id: string;
  lifelineId: string;
  startMessageOrder: number; // Message order when activation starts
  endMessageOrder: number; // Message order when activation ends
}

export interface SequenceDiagramState {
  lifelines: Lifeline[];
  messages: Message[];
  activations: Activation[];
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

// Sequence diagram layout constants
export const LIFELINE_HEADER_WIDTH = 120;
export const LIFELINE_HEADER_HEIGHT = 60;
export const LIFELINE_SPACING = 180;
export const LIFELINE_START_X = 100;
export const LIFELINE_START_Y = 80;
export const MESSAGE_SPACING = 60;
export const ACTIVATION_WIDTH = 16;
export const CANVAS_PADDING = 40;
