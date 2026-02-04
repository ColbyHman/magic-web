import React from 'react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import { Zone as ZoneEnum } from '../types';
import type { Zone as ZoneType } from '../types';
import { useCardsInZone } from '../store/gameStore';
import { Card } from './Card';

interface ZoneProps {
  zone: ZoneType;
  title: string;
  className?: string;
  children?: React.ReactNode;
  id?: string;
  setBattlefieldHover?: (cell: { row: number; col: number } | null) => void;
  isDroppable?: boolean;
}



export const ZoneComponent: React.FC<ZoneProps> = React.memo(({ zone, title, className = '', children, id, setBattlefieldHover, isDroppable = true }) => {
  const cards = useCardsInZone(zone);
  const [hoveredCell, setHoveredCellState] = React.useState<{ row: number; col: number } | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const { isOver, setNodeRef } = useDroppable({ id: id || zone, disabled: !isDroppable });

  // Filter out attached cards - they'll be rendered with their parents
  const topLevelCards = React.useMemo(() => 
    cards.filter(card => !card.attachedTo),
    [cards]
  );

  // Battlefields: render grid with hover, stack offsets, and preview
  if (zone === ZoneEnum.BATTLEFIELD || zone === ZoneEnum.OPPONENT_BATTLEFIELD) {
    // Responsive grid: columns/rows by screen size (CSS only)
    const rows = 2;
    const cols = 10;
    const grid = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => {
        const stack = cards.filter(card => card.position?.row === row && card.position?.col === col);
        return { row, col, stack };
      })
    );


    // Update parent hover state
    React.useEffect(() => {
      if (setBattlefieldHover) setBattlefieldHover(hoveredCell);
    }, [hoveredCell, setBattlefieldHover]);

    // Robust dnd-kit pointer tracking: record initial pointer, update with delta

    // Refs for all cell elements
    const cellRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const initialPointer = React.useRef<{ x: number; y: number } | null>(null);

    useDndMonitor({
      onDragStart(event) {
        // Record initial pointer position
        if (event.activatorEvent && 'clientX' in event.activatorEvent && 'clientY' in event.activatorEvent && typeof event.activatorEvent.clientX === 'number' && typeof event.activatorEvent.clientY === 'number') {
          console.log('Recording initial pointer position:', event.activatorEvent.clientX, event.activatorEvent.clientY);
          initialPointer.current = { x: event.activatorEvent.clientX, y: event.activatorEvent.clientY };
        } else {
          console.log('No valid activatorEvent for drag start');
          initialPointer.current = null;
        }
      },
      onDragMove(event) {
        if (!initialPointer.current) return;
        const pointer = {
          x: initialPointer.current.x + (event.delta?.x ?? 0),
          y: initialPointer.current.y + (event.delta?.y ?? 0),
        };
        // Find which cell contains the pointer
        let found = false;
        for (let i = 0; i < cellRefs.current.length; i++) {
          const cell = cellRefs.current[i];
          if (!cell) continue;
          const rect = cell.getBoundingClientRect();
          if (
            pointer.x >= rect.left && pointer.x <= rect.right &&
            pointer.y >= rect.top && pointer.y <= rect.bottom
          ) {
            // Map i to row/col
            const row = Math.floor(i / cols);
            const col = i % cols;
            setHoveredCellState({ row, col });
            found = true;
            break;
          }
        }
        if (!found) setHoveredCellState(null);
      },
      onDragEnd() {
        setHoveredCellState(null);
        initialPointer.current = null;
      },
      onDragCancel() {
        setHoveredCellState(null);
        initialPointer.current = null;
      },
    });

    return (
      <div
        ref={setNodeRef}
        className={`zone ${className} min-h-32 relative ring-2 ring-yellow-400 ring-opacity-60 flex items-center justify-center w-full h-full`}
        data-zone-id={id || zone}
      >
        <div className="absolute top-2 left-2 text-white text-sm font-bold bg-gradient-to-r from-black to-gray-900 bg-opacity-70 px-3 py-1 rounded-lg border border-yellow-600 border-opacity-30 shadow-lg z-10">
           {title} {/* ({cards.length}) {isOver && '[OVER]'} */}
        </div>
        <div
          ref={gridRef}
          className="relative grid gap-1 bg-green-900 bg-opacity-30 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            maxWidth: '100%',
            maxHeight: '100%',
            minHeight: '100%',
          }}
        >
          {grid.flat().map(({ row, col, stack }, i) => (
            <div
              key={`cell-${row}-${col}`}
              ref={el => { cellRefs.current[i] = el; }}
              className={`relative rounded flex items-center justify-center transition-all duration-75 bg-green-950/30`
                + (hoveredCell && hoveredCell.row === row && hoveredCell.col === col ? ' border-yellow-400 bg-yellow-100 bg-opacity-20' : stack.length ? ' border-transparent' : ' border-white border-opacity-20')}
              style={{ aspectRatio: '5/7', width: '100%', height: '100%' }}
              onMouseEnter={() => {
                setHoveredCellState({ row, col });
                // console.log(`Hovering over cell [${row},${col}] - Stack:`, stack.length, 'cards:', stack.map(c => c.name));
              }}
              onMouseLeave={() => setHoveredCellState(null)}
            >
              {/* Drop preview */}
              {hoveredCell && hoveredCell.row === row && hoveredCell.col === col && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  {/* <div className="w-20 h-28 bg-yellow-300 bg-opacity-40 rounded shadow-lg border-2 border-yellow-400 border-dashed" /> */}
                </div>
              )}
              {/* Stack cards with offset */}
              <div className="relative w-full h-full flex items-center justify-center" style={{ aspectRatio: '5/7', width: '90%', height: '90%' }}>
                {stack.map((card, i) => (
                  <div
                    key={card.id}
                    style={{
                      position: 'absolute',
                      left: i * 8,
                      top: i * 8,
                      zIndex: 30 + i,
                    }}
                  >
                    <Card card={card} />
                  </div>
                ))}
              </div>
              {/* Cell label if empty */}
              {!stack.length && (
                <div className="text-white text-xs opacity-30 select-none pointer-events-none">
                  {/* {row === 0 ? 'F' : 'B'}{col + 1} */}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Hand: render cards in a centered, overlapping row
  if (zone === ZoneEnum.HAND) {
    const [hoveredCardId, setHoveredCardId] = React.useState<string | null>(null);
    const cardWidth = 100; // Base card width in pixels
    const maxSpacing = 50; // Maximum spacing between cards
    const minSpacing = 15; // Minimum spacing (for heavy overlap)
    const containerPadding = 40;
    
    // Calculate optimal spacing based on number of cards
    // Target: keep hand within middle 50% of screen width
    const availableWidth = typeof window !== 'undefined' ? (window.innerWidth * 0.5) : 600;
    const optimalSpacing = topLevelCards.length > 1 
      ? Math.max(minSpacing, Math.min(maxSpacing, (availableWidth - cardWidth) / (topLevelCards.length - 1)))
      : maxSpacing;

    return (
      <div
        ref={setNodeRef}
        className={`zone ${className} relative ${isOver ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}`}
        data-zone-id={id || zone}
      >
        <div className="absolute top-2 left-2 text-white text-sm font-bold bg-gradient-to-r from-black to-gray-900 bg-opacity-70 px-3 py-1 rounded-lg border border-yellow-600 border-opacity-30 shadow-lg z-10">
          {title} ({topLevelCards.length}) {isOver && '[OVER]'}
        </div>
        
        {/* Centered card container */}
        <div className="w-full h-full flex items-center justify-center">
          <div 
            className="relative flex items-center justify-center"
            style={{
              height: '100%',
            }}
          >
            {topLevelCards.map((card, index) => {
              const totalWidth = optimalSpacing * (topLevelCards.length - 1) + cardWidth;
              const startOffset = -totalWidth / 2 + (cardWidth / 2);
              const xPosition = startOffset + (index * optimalSpacing);
              const isHovered = hoveredCardId === card.id;
              
              return (
                <div
                  key={card.id}
                  style={{
                    position: 'absolute',
                    left: `calc(50% + ${xPosition}px)`,
                    transform: 'translateX(-50%)',
                    zIndex: isHovered ? 1000 : 30 + index,
                  }}
                  onMouseEnter={() => setHoveredCardId(card.id)}
                  onMouseLeave={() => setHoveredCardId(null)}
                >
                  <Card card={card} />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Lands: render cards in a grid layout with position support
  if (zone === ZoneEnum.LANDS) {
    // Create a grid for lands - 1 row, many columns
    const rows = 1;
    const cols = 10;
    const grid = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => {
        const stack = topLevelCards.filter(card => card.position?.row === row && card.position?.col === col);
        return { row, col, stack };
      })
    );

    // Refs for all cell elements
    const cellRefs = React.useRef<(HTMLDivElement | null)[]>([]);
    const initialPointer = React.useRef<{ x: number; y: number } | null>(null);

    useDndMonitor({
      onDragStart(event) {
        // Record initial pointer position
        if (event.activatorEvent && 'clientX' in event.activatorEvent && 'clientY' in event.activatorEvent && typeof event.activatorEvent.clientX === 'number' && typeof event.activatorEvent.clientY === 'number') {
          console.log(`Recording initial pointer position for ${zone}:`, event.activatorEvent.clientX, event.activatorEvent.clientY);
          initialPointer.current = { x: event.activatorEvent.clientX, y: event.activatorEvent.clientY };
        } else {
          initialPointer.current = null;
        }
      },
      onDragMove(event) {
        if (!initialPointer.current) return;
        const pointer = {
          x: initialPointer.current.x + (event.delta?.x ?? 0),
          y: initialPointer.current.y + (event.delta?.y ?? 0),
        };
        // Find which cell contains the pointer
        let found = false;
        for (let i = 0; i < cellRefs.current.length; i++) {
          const cell = cellRefs.current[i];
          if (!cell) continue;
          const rect = cell.getBoundingClientRect();
          if (
            pointer.x >= rect.left && pointer.x <= rect.right &&
            pointer.y >= rect.top && pointer.y <= rect.bottom
          ) {
            // Map i to row/col
            const row = Math.floor(i / cols);
            const col = i % cols;
            setHoveredCellState({ row, col });
            found = true;
            break;
          }
        }
        if (!found) setHoveredCellState(null);
      },
      onDragEnd() {
        setHoveredCellState(null);
        initialPointer.current = null;
      },
      onDragCancel() {
        setHoveredCellState(null);
        initialPointer.current = null;
      },
    });

    // Update parent hover state
    React.useEffect(() => {
      if (setBattlefieldHover) setBattlefieldHover(hoveredCell);
    }, [hoveredCell, setBattlefieldHover]);

    return (
      <div
        ref={setNodeRef}
        className={`zone ${className} relative ${isOver ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}`}
        data-zone-id={id || zone}
      >
        <div className="absolute top-2 left-2 text-white text-sm font-bold bg-gradient-to-r from-black to-gray-900 bg-opacity-70 px-3 py-1 rounded-lg border border-yellow-600 border-opacity-30 shadow-lg z-10">
          {title} ({topLevelCards.length}) {isOver && '[OVER]'}
        </div>
        <div 
          className="relative grid gap-1 w-full h-full p-2"
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {grid.flat().map(({ row, col, stack }, i) => (
            <div
              key={`cell-${row}-${col}`}
              ref={el => { cellRefs.current[i] = el; }}
              className={`relative border border-dashed rounded flex items-center justify-center bg-green-900/20 ${hoveredCell && hoveredCell.row === row && hoveredCell.col === col ? 'border-yellow-400 bg-yellow-100 bg-opacity-20' : stack.length ? 'border-transparent' : 'border-white/20'}`}
              style={{ aspectRatio: '5/7' }}
              onMouseEnter={() => setHoveredCellState({ row, col })}
              onMouseLeave={() => setHoveredCellState(null)}
            >
              {/* Stack cards with offset */}
              <div className="relative w-full h-full flex items-center justify-center" style={{ aspectRatio: '5/7', width: '90%', height: '90%' }}>
                {stack.map((card, index) => (
                  <div
                    key={card.id}
                    style={{
                      position: 'absolute',
                      left: index * 8, // Smaller offset for hand/lands
                      top: index * 8,
                      zIndex: 30 + index,
                    }}
                  >
                    <Card card={card} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Graveyard and Exile: card-sized zones that stack cards
  if (zone === ZoneEnum.GRAVEYARD || zone === ZoneEnum.EXILE) {
    return (
      <div
        ref={setNodeRef}
        className={`zone ${className} relative ${isOver ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}`}
        data-zone-id={id || zone}
      >
        <div className="absolute top-0 left-2 text-white text-xs font-bold bg-gradient-to-r from-black to-gray-900 bg-opacity-70 px-2 py-1 rounded border border-yellow-600 border-opacity-30 shadow-lg z-10">
          {title} ({cards.length}) {isOver && '[OVER]'}
        </div>
        <div className="relative w-full h-full flex items-start justify-start p-2">
          {children}
          {cards.map((card, index) => (
            <div
              key={card.id}
              className="absolute"
              style={{
                bottom: `${index * 8}px`,
                right: `${index * 8}px`,
                zIndex: 30 + index,
              }}
            >
              <Card card={card} />
            </div>
          ))}
          {cards.length === 0 && (
            <div className="text-white text-xs opacity-30 select-none pointer-events-none">
              {title === 'Graveyard' ? '🪦' : '⛓️'}
            </div>
          )}
        </div>
      </div>
    );
  }

  // All other zones: original rendering
  return (
    <div 
      ref={setNodeRef}
      className={`zone ${className} relative ${isOver ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}`}
      data-zone-id={id || zone}
    >
      <div className="absolute top-2 left-2 text-white text-sm font-bold bg-gradient-to-r from-black to-gray-900 bg-opacity-70 px-3 py-1 rounded-lg border border-yellow-600 border-opacity-30 shadow-lg z-10">
        {title} ({cards.length}) {isOver && '[OVER]'}
      </div>
      <div className={`w-full h-full flex flex-wrap gap-2 ${isOver ? 'drag-over' : ''} p-2 overflow-auto`}>
        {children}
        {cards.map((card) => {
          console.log('Rendering Card component:', card.name, 'in zone:', zone);
          return <Card key={card.id} card={card} />;
        })}
      </div>
    </div>
  );
});