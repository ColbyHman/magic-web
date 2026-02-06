import React from 'react';
import type { DeckEntry } from '../types';
import styles from './DeckCard.module.css';

interface DeckCardProps {
  entry: DeckEntry;
  onQuantityChange?: (newQuantity: number) => void;
  onRemove?: () => void;
  onSetCommander?: () => void;
  onRemoveCommander?: () => void;
  onMoveToSideboard?: (toSideboard: boolean) => void;
  showValidationWarning?: boolean;
  validationMessage?: string;
  deckFormat?: string;
  onClick?: () => void;
}

export default function DeckCard({
  entry,
  onQuantityChange,
  onRemove,
  onSetCommander,
  onRemoveCommander,
  onMoveToSideboard,
  showValidationWarning = false,
  validationMessage,
  deckFormat,
  onClick,
}: DeckCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [showContextMenu, setShowContextMenu] = React.useState(false);
  const [contextMenuPos, setContextMenuPos] = React.useState({ x: 0, y: 0 });
  
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenuPos({ x: e.clientX, y: e.clientY });
    setShowContextMenu(true);
  };
  
  const handleIncrement = () => {
    if (onQuantityChange && !entry.isCommander) {
      onQuantityChange(entry.quantity + 1);
    }
  };
  
  const handleDecrement = () => {
    if (onQuantityChange && entry.quantity > 1 && !entry.isCommander) {
      onQuantityChange(entry.quantity - 1);
    } else if (onQuantityChange && entry.quantity === 1) {
      onRemove?.();
    }
  };
  
  const isCommanderFormat = deckFormat === 'commander';
  const canBeCommander = isCommanderFormat && entry.card.type?.toLowerCase().includes('legendary');
  
  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => setShowContextMenu(false);
    if (showContextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showContextMenu]);
  
  return (
    <>
      <div
        className={`${styles.deckCard} ${entry.isCommander ? styles.commander : ''} ${showValidationWarning ? styles.warning : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={onClick}
        onContextMenu={handleContextMenu}
      >
        {/* Card Image */}
        <div className={styles.imageContainer}>
          {entry.card.imageUrl ? (
            <img src={entry.card.imageUrl} alt={entry.card.name} className={styles.cardImage} />
          ) : (
            <div className={styles.placeholder}>{entry.card.name}</div>
          )}
          
          {/* Commander Crown Badge */}
          {entry.isCommander && (
            <div className={styles.commanderBadge} title="Commander">
              👑
            </div>
          )}
          
          {/* Validation Warning Icon */}
          {showValidationWarning && (
            <div className={styles.warningBadge} title={validationMessage || 'Validation warning'}>
              ⚠️
            </div>
          )}
        </div>
        
        {/* Card Info */}
        <div className={styles.cardInfo}>
          <div className={styles.cardName}>{entry.card.name}</div>
          <div className={styles.cardType}>{entry.card.type}</div>
          {entry.card.manaCost && (
            <div className={styles.manaCost}>{entry.card.manaCost}</div>
          )}
        </div>
        
        {/* Quantity Controls (not shown for commanders) */}
        {!entry.isCommander && (
          <div className={styles.quantityControls}>
            <button
              className={styles.quantityBtn}
              onClick={handleDecrement}
              title="Decrease quantity"
            >
              −
            </button>
            <span className={styles.quantity}>{entry.quantity}</span>
            <button
              className={styles.quantityBtn}
              onClick={handleIncrement}
              title="Increase quantity"
            >
              +
            </button>
          </div>
        )}
        
        {/* Sideboard Indicator */}
        {entry.isSideboard && !entry.isCommander && (
          <div className={styles.sideboardBadge}>SB</div>
        )}
        
        {/* Remove Button (shown on hover) */}
        {isHovered && onRemove && (
          <button
            className={styles.removeBtn}
            onClick={onRemove}
            title="Remove from deck"
          >
            ×
          </button>
        )}
      </div>
      
      {/* Context Menu */}
      {showContextMenu && (
        <div
          className={styles.contextMenu}
          style={{ top: contextMenuPos.y, left: contextMenuPos.x }}
        >
          {!entry.isCommander && onMoveToSideboard && (
            <button
              className={styles.contextMenuItem}
              onClick={() => {
                onMoveToSideboard(!entry.isSideboard);
                setShowContextMenu(false);
              }}
            >
              {entry.isSideboard ? 'Move to Main Deck' : 'Move to Sideboard'}
            </button>
          )}
          
          {canBeCommander && !entry.isCommander && onSetCommander && (
            <button
              className={styles.contextMenuItem}
              onClick={() => {
                onSetCommander();
                setShowContextMenu(false);
              }}
            >
              Set as Commander
            </button>
          )}
          
          {entry.isCommander && onRemoveCommander && (
            <button
              className={styles.contextMenuItem}
              onClick={() => {
                onRemoveCommander();
                setShowContextMenu(false);
              }}
            >
              Remove as Commander
            </button>
          )}
          
          {onRemove && (
            <button
              className={`${styles.contextMenuItem} ${styles.danger}`}
              onClick={() => {
                onRemove();
                setShowContextMenu(false);
              }}
            >
              Remove from Deck
            </button>
          )}
        </div>
      )}
    </>
  );
}
