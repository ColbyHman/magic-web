import React from 'react';
import { useDroppable } from '@dnd-kit/core';
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
}



export const ZoneComponent: React.FC<ZoneProps> = React.memo(({ zone, title, className = '', children, id }) => {
  const cards = useCardsInZone(zone);
  
  const { isOver, setNodeRef } = useDroppable({
    id: id || zone,
  });

  const getZoneLayout = React.useMemo(() => {
    switch (zone) {
      case ZoneEnum.HAND:
        return 'flex flex-row flex-wrap gap-2 justify-center items-center overflow-x-auto content-center min-h-full';
      case ZoneEnum.BATTLEFIELD:
        console.log('Battlefield cards:', cards.map(c => ({ id: c.id, name: c.name, position: c.position })));
        return (
          <div className="relative h-full">
            {/* Row indicators */}
            <div className="absolute top-0 left-0 right-0 h-1/2 border-b border-yellow-600 border-opacity-30 pointer-events-none z-10">
              <div className="text-center text-white text-xs font-bold mt-1">FRONT ROW</div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none z-10">
              <div className="text-center text-white text-xs font-bold mb-3">BACK ROW</div>
            </div>
            
            {/* Playmat grid with individual droppable cells */}
            <div className="grid grid-rows-2 grid-cols-10 gap-1 p-4 pt-8 place-items-center content-start min-h-full">
              {children}
              
              {/* Render empty grid cells for direct drops */}
              {Array.from({ length: 2 }, (_, row) => (
                Array.from({ length: 10 }, (_, col) => {
                  const isOccupied = cards.some(card => 
                    card.position?.col === col && card.position?.row === row
                  );
                  
                  return (
                    <div
                      key={`cell-${row}-${col}`}
                      className={`border border-dashed rounded min-h-[84px] min-w-[60px] flex items-center justify-center ${
                        isOccupied ? 'border-transparent' : 'border-white border-opacity-20'
                      }`}
                      style={{
                        gridColumn: col + 1,
                        gridRow: row + 1,
                      }}
                    >
                      {!isOccupied && (
                        <div className="text-white text-xs opacity-30">
                          {row === 0 ? 'F' : 'B'}{col + 1}
                        </div>
                      )}
                    </div>
                  );
                })
              )).flat()}
              
              {/* Render existing cards on top */}
              {cards.map((card) => {
                const col = card.position?.col !== undefined ? card.position.col + 1 : 'auto';
                const row = card.position?.row !== undefined ? card.position.row + 1 : 'auto';
                console.log(`Card ${card.id} at col: ${col}, row: ${row}, position:`, card.position);
                return (
                  <div 
                    key={card.id}
                    className="absolute"
                    style={{
                      gridColumn: col,
                      gridRow: row,
                    }}
                  >
                    <Card card={card} />
                  </div>
                );
              })}
            </div>
          </div>
        );
      case ZoneEnum.OPPONENT_BATTLEFIELD:
        console.log('Opponent battlefield cards:', cards);
        return 'grid grid-rows-2 grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-15 gap-1 p-4 place-items-center content-start min-h-full';
      case ZoneEnum.LANDS:
        return 'flex flex-row flex-wrap gap-2 justify-center items-center p-2 min-h-full content-center';
      case ZoneEnum.GRAVEYARD:
        return 'flex-col items-center justify-center p-2 min-h-full';
      default:
        return 'flex flex-wrap gap-2 min-h-full';
    }
  }, [zone]);

  return (
    <div 
      ref={setNodeRef}
      className={`zone ${className} min-h-32 relative ${isOver ? 'ring-2 ring-yellow-400 ring-opacity-60' : ''}`}
      data-zone-id={id || zone}
    >
      <div className="absolute top-2 left-2 text-white text-sm font-bold bg-gradient-to-r from-black to-gray-900 bg-opacity-70 px-3 py-1 rounded-lg border border-yellow-600 border-opacity-30 shadow-lg z-10">
        {title} ({cards.length}) {isOver && '[OVER]'}
      </div>
      
      <div
        className={`w-full h-full ${getZoneLayout} ${
          isOver ? 'drag-over' : ''
        }`}
      >
        {children}
        {zone === ZoneEnum.BATTLEFIELD && (
          <>
            {cards.map((card) => {
              const col = card.position?.col !== undefined ? card.position.col + 1 : 'auto';
              const row = card.position?.row !== undefined ? card.position.row + 1 : 'auto';
              console.log(`Card ${card.id} at col: ${col}, row: ${row}, position:`, card.position);
              return (
                <div 
                  key={card.id}
                  className="contents"
                  style={{
                    gridColumn: col,
                    gridRow: row,
                  }}
                >
                  <Card card={card} />
                </div>
              );
            })}
          </>
        )}
        {zone === ZoneEnum.OPPONENT_BATTLEFIELD && (
          <>
            {cards.map((card) => (
              <div 
                key={card.id}
                className="contents"
                style={{
                  gridColumn: card.position?.col !== undefined ? card.position.col + 1 : 'auto',
                  gridRow: card.position?.row !== undefined ? card.position.row + 1 : 'auto',
                }}
              >
                <Card card={card} />
              </div>
            ))}
          </>
        )}
        {zone !== ZoneEnum.BATTLEFIELD && zone !== ZoneEnum.OPPONENT_BATTLEFIELD && (
          <>
            {cards.map((card) => (
              <Card key={card.id} card={card} />
            ))}
          </>
        )}
      </div>
    </div>
  );
});