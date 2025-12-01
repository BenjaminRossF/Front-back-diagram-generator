/**
 * BumlBuilder - Implements the Builder design pattern for constructing
 * SequenceDiagramState from .buml file format.
 * 
 * The .buml format is a JSON-based format for storing sequence diagrams.
 */

import {
  SequenceDiagramState,
  Lifeline,
  Message,
  Activation,
} from '@/types/diagram';

// Interface for the diagram builder
interface IDiagramBuilder {
  reset(): void;
  addLifeline(lifeline: Lifeline): IDiagramBuilder;
  addMessage(message: Message): IDiagramBuilder;
  addActivation(activation: Activation): IDiagramBuilder;
  setActivatedBlocks(blocks: string[]): IDiagramBuilder;
  build(): BumlDiagram;
}

// Complete diagram structure including activated blocks
export interface BumlDiagram {
  state: SequenceDiagramState;
  activatedBlocks: string[];
  name?: string;
}

// File format version for future compatibility
export const BUML_VERSION = '1.0';

// Documentation for coding agents
export interface BumlDocumentation {
  description: string;
  structure: {
    lifelines: string;
    messages: string;
    activations: string;
    activatedBlocks: string;
  };
  usage: string;
}

// File format structure
export interface BumlFileFormat {
  version: string;
  _documentation?: BumlDocumentation;
  diagram: {
    lifelines: Lifeline[];
    messages: Message[];
    activations: Activation[];
    activatedBlocks: string[];
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    name?: string;
  };
}

/**
 * BumlBuilder class implementing the Builder pattern
 * Allows step-by-step construction of a sequence diagram
 */
export class BumlBuilder implements IDiagramBuilder {
  private lifelines: Lifeline[] = [];
  private messages: Message[] = [];
  private activations: Activation[] = [];
  private activatedBlocks: string[] = [];

  constructor() {
    this.reset();
  }

  /**
   * Resets the builder to initial state
   */
  reset(): void {
    this.lifelines = [];
    this.messages = [];
    this.activations = [];
    this.activatedBlocks = [];
  }

  /**
   * Adds a lifeline to the diagram
   */
  addLifeline(lifeline: Lifeline): IDiagramBuilder {
    this.lifelines.push(lifeline);
    return this;
  }

  /**
   * Adds a message to the diagram
   */
  addMessage(message: Message): IDiagramBuilder {
    this.messages.push(message);
    return this;
  }

  /**
   * Adds an activation to the diagram
   */
  addActivation(activation: Activation): IDiagramBuilder {
    this.activations.push(activation);
    return this;
  }

  /**
   * Sets the activated blocks
   */
  setActivatedBlocks(blocks: string[]): IDiagramBuilder {
    this.activatedBlocks = [...blocks];
    return this;
  }

  /**
   * Builds and returns the complete diagram
   */
  build(): BumlDiagram {
    const result: BumlDiagram = {
      state: {
        lifelines: [...this.lifelines],
        messages: [...this.messages],
        activations: [...this.activations],
      },
      activatedBlocks: [...this.activatedBlocks],
    };
    return result;
  }
}

/**
 * Director class that knows how to construct diagrams from different sources
 */
export class BumlDirector {
  private builder: IDiagramBuilder;

  constructor(builder: IDiagramBuilder) {
    this.builder = builder;
  }

  /**
   * Constructs a diagram from a BumlFileFormat object
   */
  constructFromFile(fileContent: BumlFileFormat): BumlDiagram {
    this.builder.reset();

    // Add all lifelines
    for (const lifeline of fileContent.diagram.lifelines) {
      this.builder.addLifeline(lifeline);
    }

    // Add all messages
    for (const message of fileContent.diagram.messages) {
      this.builder.addMessage(message);
    }

    // Add all activations
    for (const activation of fileContent.diagram.activations) {
      this.builder.addActivation(activation);
    }

    // Set activated blocks
    this.builder.setActivatedBlocks(fileContent.diagram.activatedBlocks);

    return this.builder.build();
  }

  /**
   * Constructs a diagram from current state (for serialization)
   */
  constructFromState(
    state: SequenceDiagramState,
    activatedBlocks: Set<string>
  ): BumlDiagram {
    this.builder.reset();

    // Add all lifelines
    for (const lifeline of state.lifelines) {
      this.builder.addLifeline(lifeline);
    }

    // Add all messages
    for (const message of state.messages) {
      this.builder.addMessage(message);
    }

    // Add all activations
    for (const activation of state.activations) {
      this.builder.addActivation(activation);
    }

    // Set activated blocks
    this.builder.setActivatedBlocks(Array.from(activatedBlocks));

    return this.builder.build();
  }
}

/**
 * Utility functions for .buml file operations
 */
export function serializeToBuml(
  state: SequenceDiagramState,
  activatedBlocks: Set<string>,
  name?: string
): string {
  const now = new Date().toISOString();
  const fileFormat: BumlFileFormat = {
    version: BUML_VERSION,
    _documentation: {
      description:
        'This is a .buml (Builder UML) file representing a sequence diagram. ' +
        'It describes the interaction between different actors/components (lifelines) ' +
        'through messages exchanged over time.',
      structure: {
        lifelines:
          'Array of actors/components in the diagram. Each lifeline has: ' +
          'id (unique identifier), name (display label), color (hex color for visual styling), ' +
          'and order (horizontal position from left to right, 0-indexed).',
        messages:
          'Array of arrows/communications between lifelines. Each message has: ' +
          'id (unique identifier), fromLifelineId (source actor), toLifelineId (destination actor), ' +
          'label (method/action name), description (optional details), ' +
          'type ("sync" for solid arrow requests, "return" for dashed arrow responses), ' +
          'and order (vertical position representing time sequence, 0-indexed).',
        activations:
          'Array of activation periods on lifelines (currently managed separately via activatedBlocks).',
        activatedBlocks:
          'Array of strings representing active processing periods on lifelines. ' +
          'Format: "lifelineId-startMessageOrder-endMessageOrder". ' +
          'Example: "user-0-2" means the user lifeline is active from message 0 to message 2. ' +
          'These show when a lifeline is actively processing between two consecutive messages.',
      },
      usage:
        'To recreate this diagram: 1) Create lifelines in order, ' +
        '2) Draw messages between them following the order sequence, ' +
        '3) Activate blocks between message pairs as specified. ' +
        'The visual layout flows left-to-right for lifelines and top-to-bottom for time/messages.',
    },
    diagram: {
      lifelines: state.lifelines,
      messages: state.messages,
      activations: state.activations,
      activatedBlocks: Array.from(activatedBlocks),
    },
    metadata: {
      createdAt: now,
      updatedAt: now,
      name,
    },
  };

  return JSON.stringify(fileFormat, null, 2);
}

/**
 * Parses a .buml file content and validates its structure
 */
export function parseBumlFile(content: string): BumlFileFormat {
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error('Invalid .buml file: malformed JSON');
  }

  // Validate version
  if (!parsed.version || typeof parsed.version !== 'string') {
    throw new Error('Invalid .buml file: missing or invalid version');
  }

  // Validate diagram structure
  if (!parsed.diagram) {
    throw new Error('Invalid .buml file: missing diagram data');
  }

  if (!Array.isArray(parsed.diagram.lifelines)) {
    throw new Error('Invalid .buml file: lifelines must be an array');
  }

  if (!Array.isArray(parsed.diagram.messages)) {
    throw new Error('Invalid .buml file: messages must be an array');
  }

  if (!Array.isArray(parsed.diagram.activations)) {
    parsed.diagram.activations = [];
  }

  if (!Array.isArray(parsed.diagram.activatedBlocks)) {
    parsed.diagram.activatedBlocks = [];
  }

  // Validate metadata
  if (!parsed.metadata) {
    parsed.metadata = {
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  return parsed as BumlFileFormat;
}

/**
 * Creates a diagram state from parsed .buml content using the Builder pattern
 */
export function buildDiagramFromBuml(content: string): BumlDiagram {
  const fileContent = parseBumlFile(content);
  const builder = new BumlBuilder();
  const director = new BumlDirector(builder);
  const diagram = director.constructFromFile(fileContent);
  
  // Include the name from metadata if available
  return {
    ...diagram,
    name: fileContent.metadata?.name,
  };
}
