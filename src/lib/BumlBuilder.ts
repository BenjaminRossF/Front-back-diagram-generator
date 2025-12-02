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
  ActivationBlockData,
  Group,
} from '@/types/diagram';

// Interface for the diagram builder
interface IDiagramBuilder {
  reset(): void;
  addLifeline(lifeline: Lifeline): IDiagramBuilder;
  addMessage(message: Message): IDiagramBuilder;
  addActivation(activation: Activation): IDiagramBuilder;
  addGroup(group: Group): IDiagramBuilder;
  setActivatedBlocks(blocks: string[]): IDiagramBuilder;
  setActivatedBlocksData(blocksData: Record<string, ActivationBlockData>): IDiagramBuilder;
  build(): BumlDiagram;
}

// Complete diagram structure including activated blocks
export interface BumlDiagram {
  state: SequenceDiagramState;
  activatedBlocks: string[];
  activatedBlocksData?: Record<string, ActivationBlockData>;
  name?: string;
}

// File format version for future compatibility
export const BUML_VERSION = '1.2';

// Documentation for coding agents
export interface BumlDocumentation {
  description: string;
  structure: {
    lifelines: string;
    messages: string;
    activations: string;
    activatedBlocks: string;
    activatedBlocksData?: string;
    groups?: string;
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
    activatedBlocksData?: Record<string, ActivationBlockData>;
    groups?: Group[];
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
  private activatedBlocksData: Record<string, ActivationBlockData> = {};
  private groups: Group[] = [];

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
    this.activatedBlocksData = {};
    this.groups = [];
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
   * Adds a group to the diagram
   */
  addGroup(group: Group): IDiagramBuilder {
    this.groups.push(group);
    return this;
  }

  /**
   * Sets the activated blocks (legacy format - array of keys)
   */
  setActivatedBlocks(blocks: string[]): IDiagramBuilder {
    this.activatedBlocks = [...blocks];
    return this;
  }

  /**
   * Sets the activated blocks data (new format - includes text)
   */
  setActivatedBlocksData(blocksData: Record<string, ActivationBlockData>): IDiagramBuilder {
    this.activatedBlocksData = { ...blocksData };
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
        groups: [...this.groups],
      },
      activatedBlocks: [...this.activatedBlocks],
      activatedBlocksData: { ...this.activatedBlocksData },
    };
    return result;
  }
}

/**
 * Converts a Map of activation blocks to serializable arrays/object
 */
function convertActivatedBlocksMapToSerializable(
  activatedBlocks: Map<string, ActivationBlockData>
): { blockKeys: string[]; blockData: Record<string, ActivationBlockData> } {
  const blockKeys: string[] = [];
  const blockData: Record<string, ActivationBlockData> = {};
  activatedBlocks.forEach((data, key) => {
    if (data.isActive) {
      blockKeys.push(key);
      blockData[key] = data;
    }
  });
  return { blockKeys, blockData };
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

    // Add all groups
    if (fileContent.diagram.groups) {
      for (const group of fileContent.diagram.groups) {
        this.builder.addGroup(group);
      }
    }

    // Set activated blocks (legacy format)
    this.builder.setActivatedBlocks(fileContent.diagram.activatedBlocks);

    // Set activated blocks data (new format with text)
    if (fileContent.diagram.activatedBlocksData) {
      this.builder.setActivatedBlocksData(fileContent.diagram.activatedBlocksData);
    }

    return this.builder.build();
  }

  /**
   * Constructs a diagram from current state (for serialization)
   */
  constructFromState(
    state: SequenceDiagramState,
    activatedBlocks: Map<string, ActivationBlockData>
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

    // Add all groups
    for (const group of state.groups) {
      this.builder.addGroup(group);
    }

    // Set activated blocks (convert Map to arrays/object)
    const { blockKeys, blockData } = convertActivatedBlocksMapToSerializable(activatedBlocks);
    this.builder.setActivatedBlocks(blockKeys);
    this.builder.setActivatedBlocksData(blockData);

    return this.builder.build();
  }
}

/**
 * Utility functions for .buml file operations
 */
export function serializeToBuml(
  state: SequenceDiagramState,
  activatedBlocks: Map<string, ActivationBlockData>,
  name?: string
): string {
  const now = new Date().toISOString();
  
  // Convert Map to arrays/object for serialization using utility function
  const { blockKeys, blockData } = convertActivatedBlocksMapToSerializable(activatedBlocks);

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
        activatedBlocksData:
          'Object mapping block keys to their data including isActive status and optional text label. ' +
          'The text property allows adding descriptive text to display on active blocks.',
        groups:
          'Array of groups that visually group adjacent lifelines together. Each group has: ' +
          'id (unique identifier), name (display label), color (background color for the group box), ' +
          'and lifelineIds (array of lifeline IDs that belong to this group).',
      },
      usage:
        'To recreate this diagram: 1) Create lifelines in order, ' +
        '2) Draw messages between them following the order sequence, ' +
        '3) Activate blocks between message pairs as specified, ' +
        '4) Add text labels to activated blocks using activatedBlocksData, ' +
        '5) Create groups to visually organize related lifelines. ' +
        'The visual layout flows left-to-right for lifelines and top-to-bottom for time/messages.',
    },
    diagram: {
      lifelines: state.lifelines,
      messages: state.messages,
      activations: state.activations,
      activatedBlocks: blockKeys,
      activatedBlocksData: blockData,
      groups: state.groups,
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

  // Handle activatedBlocksData (new format)
  if (!parsed.diagram.activatedBlocksData || typeof parsed.diagram.activatedBlocksData !== 'object') {
    parsed.diagram.activatedBlocksData = {};
  }

  // Handle groups (new in v1.2)
  if (!Array.isArray(parsed.diagram.groups)) {
    parsed.diagram.groups = [];
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
