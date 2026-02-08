import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { 
  PencilIcon,
  TrashIcon,
  FolderPlusIcon,
  ArrowsUpDownIcon,
  PaintBrushIcon,
} from '@heroicons/react/24/outline';

export interface FolderContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onRename: () => void;
  onChangeColor: () => void;
  onDelete: () => void;
  onCreateSubfolder: () => void;
  onMove: () => void;
  folderName: string;
}

export const FolderContextMenu: React.FC<FolderContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  onRename,
  onChangeColor,
  onDelete,
  onCreateSubfolder,
  onMove,
  folderName,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
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
  useEffect(() => {
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
    const menuWidth = 220;
    const menuHeight = 240;
    const padding = 10;

    let x = position.x;
    let y = position.y;

    // Flip horizontally if too close to right edge
    if (x + menuWidth > window.innerWidth - padding) {
      x = position.x - menuWidth;
    }

    // Flip vertically if too close to bottom edge
    if (y + menuHeight > window.innerHeight - padding) {
      y = window.innerHeight - menuHeight - padding;
    }

    return { x, y };
  };

  const menuPosition = getMenuPosition();

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={menuRef}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="fixed z-[100] bg-gray-900 border-2 border-gray-700 rounded-lg shadow-2xl overflow-hidden"
          style={{
            left: `${menuPosition.x}px`,
            top: `${menuPosition.y}px`,
            minWidth: '220px',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
            <p className="text-white font-semibold text-sm truncate" title={folderName}>
              📁 {folderName}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <button
              onClick={() => handleAction(onRename)}
              className="w-full px-4 py-2.5 text-left text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <PencilIcon className="w-5 h-5 text-gray-400" />
              <span>Rename</span>
            </button>

            <button
              onClick={() => handleAction(onChangeColor)}
              className="w-full px-4 py-2.5 text-left text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <PaintBrushIcon className="w-5 h-5 text-gray-400" />
              <span>Change Color</span>
            </button>

            <button
              onClick={() => handleAction(onCreateSubfolder)}
              className="w-full px-4 py-2.5 text-left text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <FolderPlusIcon className="w-5 h-5 text-gray-400" />
              <span>Create Subfolder</span>
            </button>

            <button
              onClick={() => handleAction(onMove)}
              className="w-full px-4 py-2.5 text-left text-white hover:bg-gray-800 transition-colors flex items-center gap-3"
            >
              <ArrowsUpDownIcon className="w-5 h-5 text-gray-400" />
              <span>Move Folder</span>
            </button>

            <div className="my-1 border-t border-gray-700" />

            <button
              onClick={() => handleAction(onDelete)}
              className="w-full px-4 py-2.5 text-left text-red-400 hover:bg-red-900 hover:bg-opacity-20 transition-colors flex items-center gap-3"
            >
              <TrashIcon className="w-5 h-5" />
              <span>Delete Folder</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
