import React from 'react';
import { motion } from 'framer-motion';
import { useDraggable } from '@dnd-kit/core';
import type { Card as CardType } from '../types';
import { Zone } from '../types';
import { useGameStore } from '../store/gameStore';
import { CardContextMenu } from './CardContextMenu';
import { CardDetailsModal } from './CardDetailsModal';
import styles from './Card.module.css';

interface CardProps {
  card: CardType;
  isDraggable?: boolean;
  zIndexOverride?: number;
  onHoverChange?: (isHovered: boolean) => void;
}

export const Card: React.FC<CardProps> = React.memo(({ card, isDraggable = true, zIndexOverride, onHoverChange }) => {
  const tapCard = useGameStore((state) => state.tapCard);
  const moveCard = useGameStore((state) => state.moveCard);
  const attachCard = useGameStore((state) => state.attachCard);
  const detachCard = useGameStore((state) => state.detachCard);
  const startAttachmentMode = useGameStore((state) => state.startAttachmentMode);
  const cancelAttachmentMode = useGameStore((state) => state.cancelAttachmentMode);
  const attachmentMode = useGameStore((state) => state.attachmentMode);
  
  const [contextMenuOpen, setContextMenuOpen] = React.useState(false);
  const [contextMenuPosition, setContextMenuPosition] = React.useState({ x: 0, y: 0 });
  const [detailsModalOpen, setDetailsModalOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: card.id,
    disabled: !isDraggable,
  });

  // Handle right-click
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuOpen(true);
  };

  // Handle "Pick up" - initiate drag
  const handlePickUp = () => {
    // Set context menu drag mode for zero-delay sensor
    if ((window as any).__setContextMenuDrag) {
      (window as any).__setContextMenuDrag(true);
    }
    
    // Get the card element
    const element = (setNodeRef as any).current || document.getElementById(`card-${card.id}`);
    if (element) {
      // Dispatch synthetic pointer event to start drag
      const rect = element.getBoundingClientRect();
      const syntheticEvent = new PointerEvent('pointerdown', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + rect.width / 2,
        clientY: rect.top + rect.height / 2,
        pointerId: 1,
        pointerType: 'mouse',
      });
      element.dispatchEvent(syntheticEvent);
    }
  };

  const handleTap = () => {
    tapCard(card.id);
  };

  const handleMoveToGraveyard = () => {
    moveCard(card.id, Zone.GRAVEYARD);
  };

  const handleExile = () => {
    // For now, exile to graveyard (you can add a separate EXILE zone later)
    moveCard(card.id, Zone.GRAVEYARD);
  };

  const handleViewDetails = () => {
    console.log('View details for:', card.name);
    setDetailsModalOpen(true);
  };

  const handleAttach = () => {
    startAttachmentMode(card.id);
  };

  const handleDetach = () => {
    detachCard(card.id);
  };

  // Handle click during attachment mode
  const handleCardClick = (e: React.MouseEvent) => {
    if (attachmentMode.active && attachmentMode.sourceCardId) {
      // Don't attach to self
      if (card.id !== attachmentMode.sourceCardId) {
        e.stopPropagation();
        attachCard(attachmentMode.sourceCardId, card.id);
      }
    }
  };

  // Cancel attachment mode when clicking outside
  React.useEffect(() => {
    if (!attachmentMode.active) return;

    const handleClickOutside = (e: MouseEvent) => {
      // If clicking outside any card, cancel attachment mode
      const target = e.target as HTMLElement;
      if (!target.closest('.card')) {
        cancelAttachmentMode();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [attachmentMode.active, cancelAttachmentMode]);

  // Handle double-click for tapping
  const handleCardDoubleClick = (e: React.MouseEvent) => {
    console.log('Double click on card:', card.name);
    if (card.zone === Zone.BATTLEFIELD || card.zone === Zone.LANDS) {
      e.stopPropagation();
      e.preventDefault();
      tapCard(card.id);
    }
  };

  const cardImageUrl = card.imageUrl || 'https://cards.scryfall.io/large/front/7/7/77c6fa74-5543-42ac-9ead-0e890b188e99.jpg?1706239968';
  
  const [imageError, setImageError] = React.useState(false);

  const cardStyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    ...(imageError ? {} : { backgroundImage: `url(${cardImageUrl})` })
  } : imageError ? {} : { backgroundImage: `url(${cardImageUrl})` };

return (
    <>
      <motion.div
        ref={setNodeRef}
        {...attributes}
        {...(isDraggable && !card.attachedTo ? listeners : {})}
        onContextMenu={handleContextMenu}
        onClick={handleCardClick}
        onMouseEnter={() => {
          setIsHovered(true);
          onHoverChange?.(true);
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          onHoverChange?.(false);
        }}
        id={`card-${card.id}`}
        style={{
          ...cardStyle,
          zIndex: zIndexOverride !== undefined ? zIndexOverride : undefined,
        }}
        className={`${styles.card} w-[6vw] h-[8.4vw] max-w-[120px] max-h-[168px] min-w-[80px] min-h-[112px] rounded-lg cursor-pointer shadow-lg overflow-hidden flex-shrink-0 ${
        isDragging ? styles.dragging : ''
      } ${card.tapped ? 'origin-center' : ''} ${
        attachmentMode.active && isHovered && card.id !== attachmentMode.sourceCardId && card.zone === Zone.BATTLEFIELD
          ? 'ring-4 ring-yellow-400 ring-opacity-80'
          : 'border-2 border-gray-800'
      }`}
      animate={{
        rotate: card.tapped ? 90 : 0,
        scale: isDragging ? 1.05 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 200,
        damping: 20,
      }}
      onDoubleClick={handleCardDoubleClick}
      whileHover={{ scale: 1.05 }}
    >
      {/* Card background - handled by style prop */}
      {imageError && (
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-red-800 rounded-lg" />
      )}
      
      {/* Fallback image handling */}
      {!imageError && (
        <img 
          src={cardImageUrl}
          alt={card.name}
          className="absolute inset-0 w-full h-full object-cover rounded-lg opacity-0"
          onError={() => setImageError(true)}
        />
      )}
      
      <div className="absolute inset-0" />
      {/* Card content - text commented for now */}
      <div className="relative h-full p-2 flex flex-col justify-between">
        {/* <div className="text-center">
          <div className="text-[clamp(10px,1.5vw,12px)] font-bold text-white drop-shadow-lg rounded px-1 mb-1 truncate">
            {card.name}
          </div>
          {card.manaCost && (
            <div className="text-[clamp(10px,1.5vw,12px)] font-bold text-white drop-shadow-lg rounded px-1 bg-red-600 bg-opacity-70">
              {card.manaCost}
            </div>
          )}
        </div> */}
        
        <div className="text-[clamp(8px,1.2vw,10px)] font-bold text-white text-center drop-shadow-lg rounded px-1 bg-black bg-opacity-60">
          {/* {card.type.split(' — ')[0]} */}
        </div>
      </div>

    </motion.div>

    <CardContextMenu
      isOpen={contextMenuOpen}
      position={contextMenuPosition}
      onClose={() => setContextMenuOpen(false)}
      onPickUp={handlePickUp}
      onTap={handleTap}
      onMoveToGraveyard={handleMoveToGraveyard}
      onExile={handleExile}
      onViewDetails={handleViewDetails}
      onAttach={handleAttach}
      onDetach={handleDetach}
      cardName={card.name}
      isTapped={card.tapped}
      isOnBattlefield={card.zone === Zone.BATTLEFIELD}
      isAttached={!!card.attachedTo}
    />

    <CardDetailsModal
      isOpen={detailsModalOpen}
      onClose={() => setDetailsModalOpen(false)}
      cardName={card.name}
      imageUrl={card.imageUrl}
    />
    </>
  );
});