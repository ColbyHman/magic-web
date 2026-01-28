import React from 'react';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay } from '@dnd-kit/core';
import { useGameStore, useCardById } from './store/gameStore';
import { Battlefield } from './components/Battlefield';
import { Card } from './components/Card';
import { Zone } from './types';

function App() {
  const moveCard = useGameStore((state) => state.moveCard);
  const moveCardWithPosition = useGameStore((state) => state.moveCardWithPosition);
  const [activeCard, setActiveCard] = React.useState<string | null>(null);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveCard(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    console.log('Drag ended:', { active: active.id, over: over?.id });

    if (!over) {
      console.log('No drop target');
      return;
    }

    const cardId = active.id as string;
    let targetZone = over.id as string;

    // Handle special zone IDs
    if (targetZone === 'exile') {
      targetZone = Zone.GRAVEYARD;
    } else if (targetZone === 'player-battlefield') {
      targetZone = Zone.BATTLEFIELD;
    } else if (targetZone === 'opponent-battlefield') {
      targetZone = Zone.OPPONENT_BATTLEFIELD;
    } else if (targetZone === 'opponent-graveyard') {
      targetZone = Zone.GRAVEYARD;
    }

    console.log('Target zone:', targetZone);

    // Only allow valid moves
    if (Object.values(Zone).includes(targetZone as Zone)) {
      console.log('Moving card:', cardId, 'to zone:', targetZone);
      
      // For battlefields, detect drop position within grid
      if (targetZone === Zone.BATTLEFIELD || targetZone === Zone.OPPONENT_BATTLEFIELD) {
        // Calculate grid position based on drop coordinates
        // For now, use a simple heuristic based on where you drop
        const dropX = (event as any).delta?.x || 0;
        const dropY = (event as any).delta?.y || 0;
        
        // Estimate grid position (this is simplified - could be enhanced with actual drop coordinates)
        const targetRow = dropY > 0 ? 1 : 0; // Positive Y = back row
        const targetCol = Math.max(0, Math.min(9, Math.floor(dropX / 50) + 5)); // Estimate column
        
        console.log('Drop position:', { x: dropX, y: dropY, targetRow, targetCol });
        
        moveCardWithPosition(cardId, targetZone as Zone, { row: targetRow, col: targetCol });
      } else if (targetZone === 'player-lands') {
        moveCard(cardId, Zone.LANDS);
      } else {
        moveCard(cardId, targetZone as Zone);
      }
    } else {
      console.log('Invalid target zone:', targetZone);
    }
  };

  const activeCardData = useCardById(activeCard || '');

  return (
    <DndContext
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-screen overflow-hidden">
        <Battlefield />
      </div>

      <DragOverlay>
        {activeCardData && (
          <div className="rotate-6">
            <Card card={activeCardData} isDraggable={false} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

export default App;