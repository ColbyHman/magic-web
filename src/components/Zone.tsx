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
}



export const ZoneComponent: React.FC<ZoneProps> = React.memo(({ zone, title, className = '', children, id, setBattlefieldHover }) => {
  const cards = useCardsInZone(zone);
  const [hoveredCell, setHoveredCellState] = React.useState<{ row: number; col: number } | null>(null);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const { isOver, setNodeRef } = useDroppable({ id: id || zone });

  // Only for battlefield: render grid, handle hover, stack offsets, and preview
  if (zone === ZoneEnum.BATTLEFIELD) {
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
        if (event.activatorEvent && typeof event.activatorEvent.clientX === 'number' && typeof event.activatorEvent.clientY === 'number') {
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
          {title} ({cards.length}) {isOver && '[OVER]'}
        </div>
        <div
          ref={gridRef}
          className="relative grid gap-1 bg-green-900 bg-opacity-30 w-full h-full"
          style={{
            gridTemplateColumns: `repeat(auto-fit, minmax(7vw, 1fr))`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            aspectRatio: `${cols * 5} / ${rows * 7}`,
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        >
          {grid.flat().map(({ row, col, stack }, i) => (
            <div
              key={`cell-${row}-${col}`}
              ref={el => cellRefs.current[i] = el}
              className={`relative border border-dashed rounded flex items-center justify-center transition-all duration-75 bg-green-950/30`
                + (hoveredCell && hoveredCell.row === row && hoveredCell.col === col ? ' border-yellow-400 bg-yellow-100 bg-opacity-20' : stack.length ? ' border-transparent' : ' border-white border-opacity-20')}
              style={{ aspectRatio: '5/7', width: '100%', height: '100%' }}
              onMouseEnter={() => setHoveredCellState({ row, col })}
              onMouseLeave={() => setHoveredCellState(null)}
            >
              {/* Drop preview */}
              {hoveredCell && hoveredCell.row === row && hoveredCell.col === col && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                  <div className="w-12 h-16 bg-yellow-300 bg-opacity-40 rounded shadow-lg border-2 border-yellow-400 border-dashed" />
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
                      zIndex: 10 + i,
                    }}
                  >
                    <Card card={card} />
                  </div>
                ))}
              </div>
              {/* Cell label if empty */}
              {!stack.length && (
                <div className="text-white text-xs opacity-30 select-none pointer-events-none">
                  {row === 0 ? 'F' : 'B'}{col + 1}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // All other zones: original rendering
  return (
    <div 
      ref={setNodeRef}
      className={`zone ${className} min-h-32 relative ${isOver ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}`}
      data-zone-id={id || zone}
    >
      <div className="absolute top-2 left-2 text-white text-sm font-bold bg-gradient-to-r from-black to-gray-900 bg-opacity-70 px-3 py-1 rounded-lg border border-yellow-600 border-opacity-30 shadow-lg z-10">
        {title} ({cards.length}) {isOver && '[OVER]'}
      </div>
      <div className={`w-full h-full flex flex-wrap gap-2 min-h-full ${isOver ? 'drag-over' : ''}`}>
        {children}
        {cards.map((card) => (
          <Card key={card.id} card={card} />
        ))}
      </div>
    </div>
  );
});