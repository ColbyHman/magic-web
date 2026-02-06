import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  StarIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
} from '@heroicons/react/24/outline';
import styles from '../pages/DeckBuilder.module.css';

export interface DeckCardOptionsMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onSetCommander?: () => void;
  onRemove: () => void;
  onViewDetails: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
  cardName: string;
  canBeCommander: boolean;
  quantity: number;
}

export const DeckCardOptionsMenu: React.FC<DeckCardOptionsMenuProps> = ({
  isOpen,
  position,
  onClose,
  onSetCommander,
  onRemove,
  onViewDetails,
  onIncrement,
  onDecrement,
  cardName,
  canBeCommander,
  quantity,
}) => {
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Close on click outside
  React.useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Delay adding listener to avoid immediate close
    setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Close on ESC key
  React.useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  // Calculate position with edge detection
  const getMenuPosition = () => {
    const menuWidth = 200;
    const menuHeight = 250;
    const padding = 10;

    let x = position.x;
    let y = position.y;

    // Flip horizontally if too close to right edge
    if (x + menuWidth > window.innerWidth - padding) {
      x = position.x - menuWidth;
    }

    // Flip vertically if too close to bottom edge
    if (y + menuHeight > window.innerHeight - padding) {
      y = position.y - menuHeight;
    }

    // Ensure minimum padding from edges
    x = Math.max(padding, Math.min(x, window.innerWidth - menuWidth - padding));
    y = Math.max(padding, Math.min(y, window.innerHeight - menuHeight - padding));

    return { x, y };
  };

  const menuPosition = getMenuPosition();

  const menuItems = [
    { label: 'Add Copy', onClick: onIncrement, icon: PlusIcon, show: true },
    { label: 'Remove Copy', onClick: onDecrement, icon: MinusIcon, show: quantity > 1 },
    { label: 'Set as Commander', onClick: onSetCommander, icon: StarIcon, show: canBeCommander && onSetCommander },
    { label: 'View Details', onClick: onViewDetails, icon: MagnifyingGlassIcon, show: true },
    { label: 'Remove from Deck', onClick: onRemove, icon: TrashIcon, show: true, danger: true },
  ].filter(item => item.show);

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.15 }}
          className={styles.contextMenu}
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }}
        >
          {/* Header */}
          <div className={styles.contextMenuHeader}>
            {cardName}
          </div>

          {/* Menu Items */}
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.onClick) {
                    item.onClick();
                  }
                  onClose();
                }}
                className={`${styles.contextMenuItem} ${item.danger ? styles.danger : ''}`}
              >
                <IconComponent className={styles.contextMenuIcon} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
