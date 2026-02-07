import React from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { useGameStore, useCardById } from './store/gameStore';
import { Card } from './components/Card';
import { PhaseIndicator } from './components/PhaseIndicator';
import { HamburgerMenu } from './components/HamburgerMenu';
import { Home } from './pages/Home';
import { Landing } from './pages/Landing';
import { CardVault } from './pages/CardVault';
import { Game } from './pages/Game';
import { Profile } from './pages/Profile';
import { MyLibrary } from './pages/MyLibrary';
import Decks from './pages/Decks';
import DeckBuilder from './pages/DeckBuilder';
import { Zone } from './types';
import { Login } from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const currentLocation = useLocation();
  const { isLoggedIn, loading: authLoading, user } = useAuth();
  const moveCard = useGameStore((state) => state.moveCard);
  const loadCards = useGameStore((state) => state.loadCards);
  const isLoading = useGameStore((state) => state.isLoading);
  const [activeCard, setActiveCard] = React.useState<string | null>(null);
  const [isContextMenuDrag, setIsContextMenuDrag] = React.useState(false);

  // Load cards from Scryfall on mount (only for authenticated users)
  React.useEffect(() => {
    if (isLoggedIn) {
      loadCards();
    }
  }, [loadCards, isLoggedIn]);

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

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="w-full h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="text-white text-2xl font-bold mb-4">Loading...</div>
          <div className="text-gray-400 text-sm">Checking authentication</div>
        </div>
      </div>
    );
  }

  // Redirect to home if user is logged in and trying to access landing page
  if (isLoggedIn && currentLocation.pathname === '/') {
    return <Navigate to="/home" replace />;
  }

  // Redirect to landing if user is not logged in and trying to access protected routes
  if (!isLoggedIn && currentLocation.pathname !== '/' && currentLocation.pathname !== '/login' && currentLocation.pathname !== '/signup') {
    return <Navigate to="/" replace />;
  }

  // Show loading state while cards are being fetched (only for authenticated users)
  if (isLoading && isLoggedIn) {
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
      {/* Conditionally render hamburger menu - hide on login and landing pages */}
      {!['/', '/login', '/signup'].includes(currentLocation.pathname) && <HamburgerMenu />}
      
      <div className="w-full h-screen overflow-auto">
        <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />}/>
        <Route path="/signup" element={<Login />} /> {/* TODO: Create signup page */}
        
        {/* Protected routes */}
        <Route path="/home" element={<Home />} />
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