/**
 * Group Utility Functions
 * Shared utilities for group-related calculations and constants
 */

import {
  Group,
  Lifeline,
  LIFELINE_HEADER_WIDTH,
  LIFELINE_SPACING,
  LIFELINE_START_X,
  LIFELINE_START_Y,
} from '@/types/diagram';

// Group box layout constants
export const GROUP_PADDING = 20;
export const GROUP_HEADER_HEIGHT = 24;
export const GROUP_BORDER_RADIUS = 8;

// Group bounds interface
export interface GroupBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Calculate group bounds based on lifelines in the group
 */
export function calculateGroupBounds(
  group: Group,
  lifelines: Lifeline[],
  canvasHeight: number
): GroupBounds | null {
  const groupLifelines = lifelines.filter((l) => group.lifelineIds.includes(l.id));
  if (groupLifelines.length === 0) return null;

  // Get min and max order positions
  const orders = groupLifelines.map((l) => l.order).sort((a, b) => a - b);
  const minOrder = orders[0];
  const maxOrder = orders[orders.length - 1];

  // Calculate bounds
  const x = LIFELINE_START_X + minOrder * LIFELINE_SPACING - GROUP_PADDING;
  const y = LIFELINE_START_Y - GROUP_HEADER_HEIGHT - GROUP_PADDING / 2;
  const width = (maxOrder - minOrder + 1) * LIFELINE_SPACING - LIFELINE_SPACING + LIFELINE_HEADER_WIDTH + GROUP_PADDING * 2;
  const height = canvasHeight - y - GROUP_PADDING;

  return { x, y, width, height };
}
