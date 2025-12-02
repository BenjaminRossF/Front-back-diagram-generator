/**
 * ExportFactory - Implements the Factory Method design pattern for
 * exporting diagrams in different formats.
 */

import {
  SequenceDiagramState,
  Lifeline,
  ActivationBlockData,
  Group,
  LIFELINE_HEADER_WIDTH,
  LIFELINE_HEADER_HEIGHT,
  LIFELINE_SPACING,
  LIFELINE_START_X,
  LIFELINE_START_Y,
  MESSAGE_SPACING,
  ACTIVATION_WIDTH,
} from '@/types/diagram';

// Export format types
export type ExportFormat = 'pdf';

// Result of an export operation
export interface ExportResult {
  success: boolean;
  error?: string;
}

// Abstract exporter interface
interface IExporter {
  export(
    state: SequenceDiagramState,
    activatedBlocks: Map<string, ActivationBlockData>,
    fileName?: string
  ): Promise<ExportResult>;
}

/**
 * Helper functions for calculating diagram positions
 */
function getLifelineX(lifeline: Lifeline): number {
  return LIFELINE_START_X + lifeline.order * LIFELINE_SPACING + LIFELINE_HEADER_WIDTH / 2;
}

function getMessageY(order: number): number {
  return LIFELINE_START_Y + LIFELINE_HEADER_HEIGHT + 30 + order * MESSAGE_SPACING;
}

// Text label layout constants for export
const TEXT_BOX_WIDTH = 80;
const TEXT_BOX_HEIGHT = 20;
const TEXT_BOX_OFFSET_X = 20;
const TEXT_PADDING = 8;

// Group box layout constants
const GROUP_PADDING = 20;
const GROUP_HEADER_HEIGHT = 24;
const GROUP_BORDER_RADIUS = 8;

/**
 * Calculate group bounds based on lifelines in the group
 */
function calculateGroupBounds(
  group: Group,
  lifelines: Lifeline[],
  canvasHeight: number
): { x: number; y: number; width: number; height: number } | null {
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

/**
 * PNG Exporter - Exports diagram as PNG image using canvas-based rendering
 */
class PDFExporter implements IExporter {
  async export(
    state: SequenceDiagramState,
    activatedBlocks: Map<string, ActivationBlockData>,
    fileName: string = 'diagram'
  ): Promise<ExportResult> {
    try {
      // Calculate canvas dimensions
      const canvasWidth = Math.max(
        800,
        LIFELINE_START_X + state.lifelines.length * LIFELINE_SPACING + 100
      );
      const canvasHeight = Math.max(
        600,
        LIFELINE_START_Y + LIFELINE_HEADER_HEIGHT + 50 + (state.messages.length + 1) * MESSAGE_SPACING + 100
      );

      // Create canvas for rendering
      const canvas = document.createElement('canvas');
      const scale = 2; // Higher resolution for better quality
      canvas.width = canvasWidth * scale;
      canvas.height = canvasHeight * scale;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        return { success: false, error: 'Failed to create canvas context' };
      }

      ctx.scale(scale, scale);

      // White background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Draw grid pattern
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 0.5;
      ctx.globalAlpha = 0.3;
      for (let x = 0; x <= canvasWidth; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y <= canvasHeight; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Draw groups (background boxes behind lifelines)
      if (state.groups) {
        state.groups.forEach((group) => {
          const bounds = calculateGroupBounds(group, state.lifelines, canvasHeight);
          if (!bounds) return;

          // Draw group background
          ctx.fillStyle = group.color;
          ctx.globalAlpha = 0.5;
          this.roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, GROUP_BORDER_RADIUS);
          ctx.fill();
          ctx.globalAlpha = 1;

          // Draw group border
          ctx.strokeStyle = group.color;
          ctx.lineWidth = 2;
          this.roundRect(ctx, bounds.x, bounds.y, bounds.width, bounds.height, GROUP_BORDER_RADIUS);
          ctx.stroke();

          // Draw group name
          if (group.name) {
            ctx.fillStyle = '#374151';
            ctx.font = '600 14px system-ui, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText(group.name, bounds.x + 12, bounds.y + GROUP_HEADER_HEIGHT / 2 + 4);
          }
        });
      }

      // Draw lifeline dashed lines
      state.lifelines.forEach((lifeline) => {
        const x = getLifelineX(lifeline);
        const startY = LIFELINE_START_Y + LIFELINE_HEADER_HEIGHT;
        const endY = canvasHeight - 40;

        ctx.setLineDash([8, 6]);
        ctx.strokeStyle = '#9CA3AF';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, endY);
        ctx.stroke();
        ctx.setLineDash([]);
      });

      // Draw activation bars
      state.lifelines.forEach((lifeline) => {
        const touchingMessages = state.messages
          .filter((m) => m.fromLifelineId === lifeline.id || m.toLifelineId === lifeline.id)
          .sort((a, b) => a.order - b.order);

        for (let i = 0; i < touchingMessages.length - 1; i++) {
          const block = {
            lifelineId: lifeline.id,
            startMessageOrder: touchingMessages[i].order,
            endMessageOrder: touchingMessages[i + 1].order,
          };
          const key = `${block.lifelineId}-${block.startMessageOrder}-${block.endMessageOrder}`;
          const blockData = activatedBlocks.get(key);

          if (blockData?.isActive) {
            const x = getLifelineX(lifeline) - ACTIVATION_WIDTH / 2;
            const startY = getMessageY(block.startMessageOrder);
            const endY = getMessageY(block.endMessageOrder);
            const height = Math.max(endY - startY, 20);
            const midY = startY + height / 2;

            ctx.fillStyle = lifeline.color;
            ctx.shadowColor = 'rgba(0,0,0,0.2)';
            ctx.shadowBlur = 2;
            ctx.shadowOffsetY = 1;
            this.roundRect(ctx, x, startY, ACTIVATION_WIDTH, height, 2);
            ctx.fill();
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetY = 0;

            // Draw text label if present
            if (blockData.text) {
              const textX = x + ACTIVATION_WIDTH + TEXT_BOX_OFFSET_X;
              const textY = midY - TEXT_BOX_HEIGHT / 2;

              // Draw text background
              ctx.fillStyle = '#ffffff';
              this.roundRect(ctx, textX, textY, TEXT_BOX_WIDTH, TEXT_BOX_HEIGHT, 4);
              ctx.fill();

              // Draw text
              ctx.fillStyle = '#4B5563';
              ctx.font = '500 11px system-ui, sans-serif';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(blockData.text, textX + TEXT_BOX_WIDTH / 2, midY, TEXT_BOX_WIDTH - TEXT_PADDING);
            }
          }
        }
      });

      // Draw messages
      state.messages.forEach((message) => {
        const fromLifeline = state.lifelines.find((l) => l.id === message.fromLifelineId);
        const toLifeline = state.lifelines.find((l) => l.id === message.toLifelineId);

        if (!fromLifeline || !toLifeline) return;

        const fromX = getLifelineX(fromLifeline);
        const toX = getLifelineX(toLifeline);
        const y = getMessageY(message.order);

        const isLeftToRight = fromX < toX;
        const adjustedFromX = isLeftToRight ? fromX + ACTIVATION_WIDTH / 2 : fromX - ACTIVATION_WIDTH / 2;
        const adjustedToX = isLeftToRight ? toX - ACTIVATION_WIDTH / 2 : toX + ACTIVATION_WIDTH / 2;
        const midX = (adjustedFromX + adjustedToX) / 2;

        const isReturn = message.type === 'return';

        // Draw line
        ctx.strokeStyle = isReturn ? '#6B7280' : '#374151';
        ctx.lineWidth = 2;
        if (isReturn) {
          ctx.setLineDash([8, 4]);
        }
        ctx.beginPath();
        ctx.moveTo(adjustedFromX, y);
        ctx.lineTo(adjustedToX, y);
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw arrowhead
        const arrowLength = 10;
        const arrowWidth = 6;
        const arrowDirection = isLeftToRight ? -1 : 1;

        if (isReturn) {
          // Open arrowhead
          ctx.strokeStyle = '#6B7280';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(adjustedToX + arrowDirection * arrowLength, y - arrowWidth);
          ctx.lineTo(adjustedToX, y);
          ctx.lineTo(adjustedToX + arrowDirection * arrowLength, y + arrowWidth);
          ctx.stroke();
        } else {
          // Filled arrowhead
          ctx.fillStyle = '#374151';
          ctx.beginPath();
          ctx.moveTo(adjustedToX, y);
          ctx.lineTo(adjustedToX + arrowDirection * arrowLength, y - arrowWidth);
          ctx.lineTo(adjustedToX + arrowDirection * arrowLength, y + arrowWidth);
          ctx.closePath();
          ctx.fill();
        }

        // Draw label
        if (message.label) {
          const labelWidth = 100;
          const labelHeight = 18;
          const labelY = y - 22;

          ctx.fillStyle = '#ffffff';
          this.roundRect(ctx, midX - labelWidth / 2, labelY, labelWidth, labelHeight, 4);
          ctx.fill();

          ctx.fillStyle = '#374151';
          ctx.font = '500 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(message.label, midX, labelY + labelHeight / 2);
        }

        // Draw description
        if (message.description) {
          const descWidth = 150;
          const descHeight = 20;
          const descY = y + 6;

          ctx.fillStyle = '#ffffff';
          this.roundRect(ctx, midX - descWidth / 2, descY, descWidth, descHeight, 4);
          ctx.fill();

          ctx.fillStyle = '#6B7280';
          ctx.font = 'italic 12px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(message.description, midX, descY + descHeight / 2);
        }
      });

      // Draw lifeline headers
      state.lifelines.forEach((lifeline) => {
        const x = LIFELINE_START_X + lifeline.order * LIFELINE_SPACING;
        const y = LIFELINE_START_Y;

        // Header box with shadow
        ctx.fillStyle = lifeline.color;
        ctx.shadowColor = 'rgba(0,0,0,0.15)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetY = 2;
        this.roundRect(ctx, x, y, LIFELINE_HEADER_WIDTH, LIFELINE_HEADER_HEIGHT, 8);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetY = 0;

        // Label
        ctx.fillStyle = '#ffffff';
        ctx.font = '600 14px system-ui, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lifeline.name, x + LIFELINE_HEADER_WIDTH / 2, y + LIFELINE_HEADER_HEIGHT / 2);
      });

      // Convert canvas to blob and download
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((b) => {
          if (b) {
            resolve(b);
          } else {
            reject(new Error('Failed to create image blob'));
          }
        }, 'image/png', 1.0);
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fileName}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }

  private roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    radius: number
  ): void {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
}

/**
 * ExportFactory - Factory Method Pattern implementation
 * Creates exporters based on the requested format
 */
export class ExportFactory {
  /**
   * Factory method to create an exporter for the specified format
   */
  static createExporter(format: ExportFormat): IExporter {
    switch (format) {
      case 'pdf':
        return new PDFExporter();
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Exports diagram in the specified format
   */
  static async exportDiagram(
    format: ExportFormat,
    state: SequenceDiagramState,
    activatedBlocks: Map<string, ActivationBlockData>,
    fileName?: string
  ): Promise<ExportResult> {
    const exporter = ExportFactory.createExporter(format);
    return exporter.export(state, activatedBlocks, fileName);
  }
}
