import React, { useState } from 'react';
import type { DeckEntry } from '../types';
import styles from '../pages/DeckBuilder.module.css';
import { DeckCardOptionsMenu } from './DeckCardOptionsMenu';
import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';

interface CompactCardRowProps {
  entry: DeckEntry;
  deckFormat: string;
  cardsWithWarnings: Set<string>;
  onUpdateQuantity: (scryfallId: string, quantity: number) => void;
  onRemove: (scryfallId: string) => void;
  onSetCommander: (scryfallId: string) => void;
  onHoverStart: (entry: DeckEntry) => void;
  onHoverEnd: () => void;
}

export default function CompactCardRow({
  entry,
  deckFormat,
  cardsWithWarnings,
  onUpdateQuantity,
  onRemove,
  onSetCommander,
  onHoverStart,
  onHoverEnd,
}: CompactCardRowProps) {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPos, setContextMenuPos] = useState({ x: 0, y: 0 });
  
  const canBeCommander = deckFormat === 'commander' && entry.card.type?.toLowerCase().includes('legendary');
  
  const handleMeatballClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Hide hover preview when opening menu
    onHoverEnd();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setContextMenuPos({ x: rect.left, y: rect.bottom });
    setShowContextMenu(true);
  };
  
  return (
    <>
      <div 
        className={styles.compactCardRow}
        onMouseEnter={() => !showContextMenu && onHoverStart(entry)}
        onMouseLeave={onHoverEnd}
      >
        <div className={styles.quantityControls}>
          <button
            className={styles.quantityBtn}
            onClick={() => onUpdateQuantity(entry.card.scryfallId, entry.quantity - 1)}
            disabled={entry.quantity <= 1}
          >
            −
          </button>
          <span className={styles.quantityDisplay}>{entry.quantity}</span>
          <button
            className={styles.quantityBtn}
            onClick={() => onUpdateQuantity(entry.card.scryfallId, entry.quantity + 1)}
          >
            +
          </button>
        </div>
        <div className={styles.cardName}>
          {entry.card.name}
          {cardsWithWarnings.has(entry.card.name) && (
            <span className={styles.warningIcon} title="Validation warning">⚠️</span>
          )}
        </div>
        <button
          className={styles.meatballMenuBtn}
          onClick={handleMeatballClick}
          title="Card options"
        >
          <EllipsisVerticalIcon className={styles.meatballIcon} />
        </button>
        <button
          className={styles.removeCardBtn}
          onClick={() => onRemove(entry.card.scryfallId)}
          title="Remove card"
        >
          ×
        </button>
      </div>
      
      <DeckCardOptionsMenu
        isOpen={showContextMenu}
        position={contextMenuPos}
        onClose={() => setShowContextMenu(false)}
        onSetCommander={canBeCommander ? () => onSetCommander(entry.card.scryfallId) : undefined}
        onRemove={() => onRemove(entry.card.scryfallId)}
        onViewDetails={() => {
          // Could add card details modal here if needed
        }}
        onIncrement={() => onUpdateQuantity(entry.card.scryfallId, entry.quantity + 1)}
        onDecrement={() => onUpdateQuantity(entry.card.scryfallId, entry.quantity - 1)}
        cardName={entry.card.name}
        canBeCommander={canBeCommander}
        quantity={entry.quantity}
      />
    </>
  );
}
