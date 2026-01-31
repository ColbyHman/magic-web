import React from 'react';
import { useDroppable, useDndMonitor } from '@dnd-kit/core';
import { Zone as ZoneEnum } from '../types';
import type { Zone as ZoneType } from '../types';
import { useCardsInZone } from '../store/gameStore';
import { Card } from './Card';
import styles from './Zone.module.css';

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
  // Filter out attached cards - they'll be rendered with their parents
  const topLevelCards = React.useMemo(() => 
    cards.filter(card => !card.attachedTo),
    [cards]
  );
  
  const [hoveredCell, setHoveredCellState] = React.useState<{ row: number; col: number } | null>(null);
  const [hoveredAttachedCard, setHoveredAttachedCard] = React.useState<string | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const { isOver, setNodeRef } = useDroppable({ id: id || zone, disabled: !isDroppable });

  // Battlefields: render grid with hover, stack offsets, and preview
  if (zone === ZoneEnum.BATTLEFIELD || zone === ZoneEnum.OPPONENT_BATTLEFIELD) {
    // Responsive grid: columns/rows by screen size (CSS only)
    const rows = 2;
    const cols = 10;
    const grid = Array.from({ length: rows }, (_, row) =>
      Array.from({ length: cols }, (_, col) => {
        const stack = topLevelCards.filter(card => card.position?.row === row && card.position?.col === col);
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
        className={`${styles.zone} ${styles.zoneContainer} ${className}`}
        data-zone-id={id || zone}
      >
        <div className={styles.zoneTitle}>
           {title} {/* ({cards.length}) {isOver && '[OVER]'} */}
        </div>
        <div
          ref={gridRef}
          className={styles.battlefieldGrid}
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
              className={`${styles.battlefieldCell} ${
                hoveredCell && hoveredCell.row === row && hoveredCell.col === col 
                  ? 'border-yellow-400 bg-yellow-100 bg-opacity-20' 
                  : stack.length 
                    ? 'border-transparent' 
                    : 'border-white border-opacity-20'
              }`}
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
              <div className={styles.cardContainer}>
                {stack.map((card, i) => (
                  <div
                    key={card.id}
                    className={styles.cardStackOffset}
                    style={{
                      left: i * 8,
                      top: i * 8,
                      zIndex: 30 + i,
                    }}
                  >
                    <div style={{ position: 'relative', zIndex: hoveredAttachedCard && card.attachedCards?.includes(hoveredAttachedCard) ? 1 : 10 }}>
                      <Card card={card} />
                    </div>
                    {/* Render attached cards beneath this card */}
                    {card.attachedCards && card.attachedCards.length > 0 && (
                      <>
                        {card.attachedCards.map((attachedId, attachIndex) => {
                          const attachedCard = cards.find(c => c.id === attachedId);
                          if (!attachedCard) return null;
                          const isHovered = hoveredAttachedCard === attachedId;
                          return (
                            <div
                              key={attachedCard.id}
                              style={{
                                position: 'absolute',
                                left: 0,
                                top: (attachIndex + 1) * 40, // 40px offset for each attached card
                                zIndex: isHovered ? 20 : attachIndex + 1, // Bring to front when hovered, otherwise stack below parent
                              }}
                            >
                              <Card 
                                card={attachedCard} 
                                onHoverChange={(hovered) => setHoveredAttachedCard(hovered ? attachedId : null)}
                              />
                            </div>
                          );
                        })}
                      </>
                    )}
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

  // Hand and Lands: render cards in a grid layout with position support
  if (zone === ZoneEnum.HAND || zone === ZoneEnum.LANDS) {
    // Create a grid for hand/lands - 1 row, many columns
    const rows = 1;
    const cols = zone === ZoneEnum.HAND ? 12 : 10; // Hand can hold more cards
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
        className={`${styles.zone} ${className} ${isOver ? styles.dragOver : ''}`}
        data-zone-id={id || zone}
      >
<div className={styles.zoneTitle}>
          {title} ({topLevelCards.length}) {isOver && '[OVER]'}
        </div>
        <div 
          className={styles.handLandsGrid}
          style={{
            gridTemplateColumns: `repeat(${cols}, minmax(60px, 1fr))`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
          }}
        >
          {grid.flat().map(({ row, col, stack }, i) => (
            <div
              key={`cell-${row}-${col}`}
              ref={el => { cellRefs.current[i] = el; }}
              className={`${styles.handLandsCell} ${
                zone === ZoneEnum.HAND ? 'bg-blue-900/20' : 'bg-green-900/20'
              } ${
                hoveredCell && hoveredCell.row === row && hoveredCell.col === col 
                  ? 'border-yellow-400 bg-yellow-100 bg-opacity-20' 
                  : stack.length 
                    ? 'border-transparent' 
                    : 'border-white/20'
              }`}
              onMouseEnter={() => setHoveredCellState({ row, col })}
              onMouseLeave={() => setHoveredCellState(null)}
            >
              {/* Stack cards with offset */}
              <div className={styles.cardContainer}>
                {stack.map((card, index) => (
                  <div
                    key={card.id}
                    className={styles.cardStackOffset}
                    style={{
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
        className={`${styles.zone} ${className} ${isOver ? styles.dragOver : ''}`}
        data-zone-id={id || zone}
      >
        <div className={styles.graveyardExileTitle}>
          {title} ({cards.length}) {isOver && '[OVER]'}
        </div>
        <div className={styles.graveyardExileContainer}>
          {children}
          {cards.map((card, index) => (
            <div
              key={card.id}
              className={styles.cardStackOffset}
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
            <div className={styles.graveyardExileEmpty}>
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
      className={`${styles.zone} ${className} ${isOver ? styles.dragOver : ''}`}
      data-zone-id={id || zone}
    >
      <div className={styles.zoneTitle}>
        {title} ({cards.length}) {isOver && '[OVER]'}
      </div>
      <div className={`${styles.defaultZone} ${isOver ? styles.dragOver : ''}`}>
        {children}
        {cards.map((card) => {
          console.log('Rendering Card component:', card.name, 'in zone:', zone);
          return <Card key={card.id} card={card} />;
        })}
      </div>
    </div>
  );
});