# Front-back-diagram-generator

A Next.js application for creating visual diagrams that explain communication between entities or layers (such as Frontend, Backend, Database, etc.).

![Diagram Generator Screenshot](https://github.com/user-attachments/assets/4ae5369a-69cc-4f7d-aba2-beb24ffa4e08)

## Features

- **Visual Entity Boxes**: Create colorful boxes representing different layers/entities
- **Drag and Drop**: Move entities around the canvas by dragging
- **Connection Arrows**: Draw arrows between entities to show communication flow
- **Customizable Labels**: Double-click to rename entities or connection labels
- **Color Selection**: Choose from 8 predefined aesthetic colors
- **Delete Functionality**: Select and remove entities or connections
- **Grid Background**: Visual grid for easier alignment

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

## Usage

1. **Add Entities**: Click on any colored button in the toolbar to add a new entity
2. **Move Entities**: Click and drag any entity to reposition it
3. **Rename Entities**: Double-click on an entity to edit its name
4. **Connect Entities**: 
   - Click "Connect Entities" button
   - Click on the source entity
   - Click on the destination entity
   - An arrow will be drawn between them
5. **Edit Connection Labels**: Double-click on a connection label to edit it
6. **Delete**: Select an entity or connection and click the × button to remove it
7. **Clear All**: Click "Clear All" to reset the canvas

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

MIT