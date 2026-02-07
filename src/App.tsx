import React from 'react';
import { useLocation } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameStore, useCardById } from './store/gameStore';
import { Card } from './components/Card';
import { PhaseIndicator } from './components/PhaseIndicator';
import { HamburgerMenu } from './components/HamburgerMenu';
import { Home } from './pages/Home';
import { CardVault } from './pages/CardVault';
import { Game } from './pages/Game';
import { Profile } from './pages/Profile';
import { MyLibrary } from './pages/MyLibrary';
import Decks from './pages/Decks';
import DeckBuilder from './pages/DeckBuilder';
import { Zone } from './types';
import { Login } from './pages/Login';

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

function AppContent() {
  const currentLocation = useLocation();
  const moveCard = useGameStore((state) => state.moveCard);
  const loadCards = useGameStore((state) => state.loadCards);
  const isLoading = useGameStore((state) => state.isLoading);
  const [activeCard, setActiveCard] = React.useState<string | null>(null);
  const [isContextMenuDrag, setIsContextMenuDrag] = React.useState(false);

  // Load cards from Scryfall on mount
  React.useEffect(() => {
    loadCards();
  }, [loadCards]);

  // Configure sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        delay: isContextMenuDrag ? 0 : 150,
        tolerance: isContextMenuDrag ? 0 : 8,
      },
    })
  );

  // Make setIsContextMenuDrag available globally for Card components
  React.useEffect(() => {
    (window as any).__setContextMenuDrag = setIsContextMenuDrag;
    return () => {
      delete (window as any).__setContextMenuDrag;
    };
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    console.log('Drag started for card ID:', event.active.id);
    setActiveCard(event.active.id as string);
  };

  // Track hovered cells globally for drag-and-drop
  const [battlefieldHover, setBattlefieldHover] = React.useState<{ row: number; col: number } | null>(null);
  const [handHover, setHandHover] = React.useState<{ row: number; col: number } | null>(null);
  const [landsHover, setLandsHover] = React.useState<{ row: number; col: number } | null>(null);
  console.log('Hover cells - Battlefield:', battlefieldHover, 'Hand:', handHover, 'Lands:', landsHover);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setIsContextMenuDrag(false);

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
      const card = useGameStore.getState().cards.find(c => c.instanceId === cardId);
      
      // Move the main card
      if (targetZone === Zone.BATTLEFIELD && battlefieldHover) {
        moveCard(cardId, targetZone as Zone, battlefieldHover);
      } else if (targetZone === Zone.HAND && handHover) {
        moveCard(cardId, targetZone as Zone, handHover);
      } else if (targetZone === Zone.LANDS && landsHover) {
        moveCard(cardId, targetZone as Zone, landsHover);
      } else {
        moveCard(cardId, targetZone as Zone);
      }

      // If the card has attached cards, move them too (only within battlefield)
      if (card?.attachedCards && card.attachedCards.length > 0 && targetZone === Zone.BATTLEFIELD) {
        const targetPosition = battlefieldHover || card.position;
        card.attachedCards.forEach(attachedId => {
          moveCard(attachedId, targetZone as Zone, targetPosition);
        });
      }
    }
    setBattlefieldHover(null);
    setHandHover(null);
    setLandsHover(null);
  };

  const activeCardData = useCardById(activeCard || '');

  // Show loading state while cards are being fetched
  if (isLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gradient-to-br from-green-900 via-green-800 to-green-950">
        <div className="text-center">
          <div className="text-yellow-400 text-2xl font-bold mb-4">Loading Cards...</div>
          <div className="text-white text-sm">Fetching card data from Scryfall</div>
        </div>
      </div>
    );
  }
  
  return (
    <>
      {/* Conditionally render hamburger menu - hide on login page */}
      {currentLocation.pathname !== "/login" && <HamburgerMenu />}
      
      <div className="w-full h-screen overflow-auto">
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/library" element={<MyLibrary />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/library/vault" element={<CardVault />} />
        <Route path="/library/decks" element={<Decks />} />
        <Route path="/library/decks/:deckId" element={<DeckBuilder />} />
        <Route 
          path="/games/battlefield" 
          element={
            <DndContext
              sensors={sensors}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <div className="w-full h-screen overflow-hidden bg-gradient-to-br from-green-900 via-green-800 to-green-950">
                <PhaseIndicator />
                <Game setBattlefieldHover={setBattlefieldHover} setHandHover={setHandHover} setLandsHover={setLandsHover} />
              </div>
              <DragOverlay>
                {activeCardData && (
                  <div className="rotate-6">
                    <Card card={activeCardData} isDraggable={false} />
                  </div>
                )}
              </DragOverlay>
            </DndContext>
          } 
        />
      </Routes>
      </div>
    </>
  );
}

export default App;