import React from 'react';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameStore, useCardById } from './store/gameStore';
import { Battlefield } from './components/Battlefield';
import { Card } from './components/Card';
import { Zone } from './types';

function App() {
  const moveCard = useGameStore((state) => state.moveCard);
  const [activeCard, setActiveCard] = React.useState<string | null>(null);

  // Configure sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started for card ID:', event.active.id);
    setActiveCard(event.active.id as string);
  };

  // Track battlefield hovered cell globally for drag-and-drop
  const [battlefieldHover, setBattlefieldHover] = React.useState<{ row: number; col: number } | null>(null);
  console.log('Battlefield hover cell:', battlefieldHover);
  
  // Pass setBattlefieldHover to ZoneComponent for battlefield

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    let targetZone = over.id as string;

    if (targetZone === 'exile') {
      targetZone = Zone.GRAVEYARD;
    } else if (targetZone === 'player-battlefield') {
      targetZone = Zone.BATTLEFIELD;
    } else if (targetZone === 'opponent-battlefield') {
      targetZone = Zone.OPPONENT_BATTLEFIELD;
    } else if (targetZone === 'opponent-graveyard') {
      targetZone = Zone.GRAVEYARD;
    } else if (targetZone === 'player-lands') {
      targetZone = Zone.LANDS;
    }

    if (Object.values(Zone).includes(targetZone as Zone)) {
      if ((targetZone === Zone.BATTLEFIELD || targetZone === Zone.OPPONENT_BATTLEFIELD) && battlefieldHover) {
        moveCard(cardId, targetZone as Zone, battlefieldHover);
      } else {
        moveCard(cardId, targetZone as Zone);
      }
    }
    setBattlefieldHover(null);
  };

  const activeCardData = useCardById(activeCard || '');

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full h-screen overflow-hidden">
        <Battlefield setBattlefieldHover={setBattlefieldHover} />
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