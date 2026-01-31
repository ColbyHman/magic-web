import React from 'react';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameStore, useCardById } from './store/gameStore';
import { Battlefield } from './components/Battlefield';
import { Card } from './components/Card';
import { PhaseIndicator } from './components/PhaseIndicator';
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

  // Track hovered cells globally for drag-and-drop
  const [battlefieldHover, setBattlefieldHover] = React.useState<{ row: number; col: number } | null>(null);
  const [handHover, setHandHover] = React.useState<{ row: number; col: number } | null>(null);
  const [landsHover, setLandsHover] = React.useState<{ row: number; col: number } | null>(null);
  console.log('Hover cells - Battlefield:', battlefieldHover, 'Hand:', handHover, 'Lands:', landsHover);
  
  // Pass setBattlefieldHover to ZoneComponent for battlefield

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const cardId = active.id as string;
    let targetZone = over.id as string;

    // Map zone IDs to Zone enum
    if (targetZone === 'player-battlefield') {
      targetZone = Zone.BATTLEFIELD;
    } else if (targetZone === 'player-lands') {
      targetZone = Zone.LANDS;
    } else if (targetZone === 'player-hand') {
      targetZone = Zone.HAND;
    } else if (targetZone === 'opponent-battlefield') {
      // Prevent dropping in opponent's battlefield
      return;
    } else if (targetZone === 'opponent-graveyard') {
      // Prevent dropping in opponent's graveyard
      return;
    } else if (targetZone === 'opponent-exile') {
      // Prevent dropping in opponent's exile
      return;
    } else if (targetZone === 'player-graveyard') {
      targetZone = Zone.GRAVEYARD;
    } else if (targetZone === 'player-exile') {
      targetZone = Zone.EXILE;
    }

    // Only allow valid zones
    if (Object.values(Zone).includes(targetZone as Zone)) {
      if (targetZone === Zone.BATTLEFIELD && battlefieldHover) {
        moveCard(cardId, targetZone as Zone, battlefieldHover);
      } else if (targetZone === Zone.HAND && handHover) {
        moveCard(cardId, targetZone as Zone, handHover);
      } else if (targetZone === Zone.LANDS && landsHover) {
        moveCard(cardId, targetZone as Zone, landsHover);
      } else {
        moveCard(cardId, targetZone as Zone);
      }
    }
    setBattlefieldHover(null);
    setHandHover(null);
    setLandsHover(null);
  };

  const activeCardData = useCardById(activeCard || '');

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <PhaseIndicator />
      
      <div className="w-full h-screen overflow-hidden">
        <Battlefield setBattlefieldHover={setBattlefieldHover} setHandHover={setHandHover} setLandsHover={setLandsHover} />
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