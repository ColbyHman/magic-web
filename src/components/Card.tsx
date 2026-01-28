import React from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import type { Card as CardType } from '../types';
import { Zone } from '../types';
import { useGameStore } from '../store/gameStore';

interface CardProps {
  card: CardType;
  isDraggable?: boolean;
}

export const Card: React.FC<CardProps> = React.memo(({ card, isDraggable = true }) => {
  const tapCard = useGameStore((state) => state.tapCard);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: card.id,
    disabled: !isDraggable || card.zone === Zone.GRAVEYARD,
  });

  const handleCardClick = (e: React.MouseEvent) => {
    // Only allow tapping on battlefield cards
    if (card.zone === Zone.BATTLEFIELD && card.type !== 'Land') {
      e.stopPropagation();
      tapCard(card.id);
    }
  };

  // Use a generic MTG card frame image for all cards
  const cardImageUrl = "https://cards.scryfall.io/large/front/7/7/77c6fa74-5543-42ac-9ead-0e890b188e99.jpg?1706239968";
  
  const [imageError, setImageError] = React.useState(false);

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`card relative w-[6vw] h-[8.4vw] max-w-[120px] max-h-[168px] min-w-[80px] min-h-[112px] rounded-lg border-2 border-gray-800 cursor-pointer shadow-lg overflow-hidden flex-shrink-0 ${
        isDragging ? 'dragging' : ''
      } ${card.tapped ? 'origin-center' : ''}`}
      animate={{
        rotate: card.tapped ? 90 : 0,
        scale: isDragging ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      onClick={handleCardClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {/* Card background image */}
      {!imageError ? (
        <img 
          src={cardImageUrl}
          alt={card.name}
          className="absolute inset-0 w-full h-full object-cover rounded-lg"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-lg" />
      )}
      
      {/* Dark overlay for better text readability */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />
      
      {/* Card content */}
      <div className="relative h-full p-2 flex flex-col justify-between">
        <div className="text-center">
          <div className="text-[clamp(10px,1.5vw,12px)] font-bold text-white drop-shadow-lg rounded px-1 mb-1 truncate">
            {card.name}
          </div>
          {card.manaCost && (
            <div className="text-[clamp(10px,1.5vw,12px)] font-bold text-white drop-shadow-lg rounded px-1 bg-red-600 bg-opacity-70">
              {card.manaCost}
            </div>
          )}
        </div>
        
        <div className="text-[clamp(8px,1.2vw,10px)] font-bold text-white text-center drop-shadow-lg rounded px-1 bg-black bg-opacity-60">
          {card.type.split(' — ')[0]}
        </div>
      </div>

      {/* Tapped overlay */}
      {card.tapped && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-40 rounded-lg pointer-events-none" />
      )}
    </motion.div>
  );
});