# Front-back-diagram-generator

A Next.js application for creating **UML Sequence Diagrams** that visualize communication flow between system components (such as Frontend, Backend, AI, Database, etc.).

![Sequence Diagram Generator Screenshot](https://github.com/user-attachments/assets/4ae5369a-69cc-4f7d-aba2-beb24ffa4e08)

## Features

### Sequence Diagram Elements

- **Lifelines (Actors)**: Vertical dashed lines representing system components at the top
- **Activation Bars**: Colored rectangles showing when a component is actively processing
- **Synchronous Messages**: Solid arrows (→) representing requests that wait for response
- **Return Messages**: Dashed arrows (⇠) representing responses/return values
- **Time Flow**: Vertical axis represents time flowing downwards

### Interactions

- **Add Actors**: Click colored buttons to add new actors/lifelines
- **Rename Actors**: Double-click actor headers to edit names
- **Add Messages**: Use "Request" (solid arrow) or "Return" (dashed arrow) buttons, then click source and destination actors
- **Edit Message Labels**: Double-click on message labels to edit
- **Add Activations**: Select an actor and click "Add Activation" to show processing time
- **Delete Elements**: Select any element and click × to remove it
- **Clear All**: Reset the entire diagram

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Styling
- **React 19** - UI components

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/BenjaminRossF/Front-back-diagram-generator.git
cd Front-back-diagram-generator
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Understanding Sequence Diagrams

### The Coordinate System
- **Horizontal Axis (Actors)**: Components listed at the top (e.g., Front, Back, AI)
- **Vertical Axis (Time)**: Time flows downwards from top to bottom

### Lifelines (Dashed Lines)
Each actor has a vertical dashed line extending downwards, representing the component's existence during the interaction.

### Activation Bars (Colored Rectangles)
Solid colored rectangles on lifelines indicate when a component is:
- Active or processing a request
- Waiting for a return value

When only the dashed line is visible, the system is idle.

### Messages (Arrows)
- **Solid Arrow (→)**: Synchronous Request - sender waits for receiver to finish
- **Dashed Arrow (⇠)**: Return/Reply - result being sent back to caller

### Example Flow
1. **Trigger**: An event triggers the Frontend
2. **Hand-off**: Frontend passes control to Backend
3. **Processing**: Backend requests AI processing
4. **Return**: AI returns data → Backend returns data → Frontend displays result

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT