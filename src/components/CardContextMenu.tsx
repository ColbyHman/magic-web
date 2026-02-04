import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  HandRaisedIcon,
  ArrowPathIcon,
  DocumentIcon,
  NoSymbolIcon,
  MagnifyingGlassIcon,
  PaperClipIcon,
  LockOpenIcon
} from '@heroicons/react/24/outline';

export interface CardContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onPickUp: () => void;
  onTap: () => void;
  onMoveToGraveyard: () => void;
  onExile: () => void;
  onViewDetails: () => void;
  onAttach?: () => void;
  onDetach?: () => void;
  cardName: string;
  isTapped: boolean;
  isOnBattlefield: boolean;
  isAttached: boolean;
}

export const CardContextMenu: React.FC<CardContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  onPickUp,
  onTap,
  onMoveToGraveyard,
  onExile,
  onViewDetails,
  onAttach,
  onDetach,
  cardName,
  isTapped,
  isOnBattlefield,
  isAttached,
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
    { label: 'Pick up', onClick: onPickUp, icon: HandRaisedIcon, show: true },
    { label: isTapped ? 'Untap' : 'Tap', onClick: onTap, icon: ArrowPathIcon, show: true },
    { label: 'Attach to...', onClick: onAttach, icon: PaperClipIcon, show: isOnBattlefield && !isAttached && onAttach },
    { label: 'Detach', onClick: onDetach, icon: LockOpenIcon, show: isAttached && onDetach },
    { label: 'Move to Graveyard', onClick: onMoveToGraveyard, icon: DocumentIcon, show: true },
    { label: 'Exile', onClick: onExile, icon: NoSymbolIcon, show: true },
    { label: 'View Details', onClick: onViewDetails, icon: MagnifyingGlassIcon, show: true },
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
          className="fixed z-[100]"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
          }}
        >
          <div className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 border-2 border-yellow-600 border-opacity-60 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-95 min-w-[200px]">
            {/* Header */}
            <div className="px-4 py-2 border-b border-yellow-600 border-opacity-30">
              <div className="text-yellow-400 font-bold text-sm truncate">
                {cardName}
              </div>
            </div>

            {/* Menu Items */}
            <div className="py-2">
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
                    className="w-full px-4 py-2 text-left text-white hover:bg-yellow-600 hover:bg-opacity-20 transition-colors flex items-center gap-3 text-sm"
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
