import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface DeckNameConflictModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDeckName: string;
  suggestedName: string;
  onUseSuggestedName: () => void;
  onRename: (newName: string) => void;
  onOverwrite: () => void;
}

export const DeckNameConflictModal: React.FC<DeckNameConflictModalProps> = ({
  isOpen,
  onClose,
  existingDeckName,
  suggestedName,
  onUseSuggestedName,
  onRename,
  onOverwrite,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [customName, setCustomName] = useState(suggestedName);
  const [showOverwriteConfirm, setShowOverwriteConfirm] = useState(false);

  const handleRename = () => {
    if (customName.trim()) {
      onRename(customName.trim());
    }
  };

  const handleOverwrite = () => {
    if (showOverwriteConfirm) {
      onOverwrite();
    } else {
      setShowOverwriteConfirm(true);
    }
  };

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-75 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-md w-full pointer-events-auto border-2 border-yellow-600 border-opacity-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 px-6 py-4 border-b-2 border-yellow-600 border-opacity-50">
                <h2 className="text-2xl font-bold text-yellow-400">Deck Name Conflict</h2>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-white text-lg">
                  A deck named <span className="font-bold text-yellow-400">"{existingDeckName}"</span> already exists.
                </p>

                {!isRenaming && !showOverwriteConfirm && (
                  <>
                    <p className="text-gray-300 text-sm">
                      Choose how you'd like to proceed:
                    </p>

                    <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                      <p className="text-gray-400 text-sm mb-2">Suggested name:</p>
                      <p className="text-white font-semibold">{suggestedName}</p>
                    </div>
                  </>
                )}

                {isRenaming && (
                  <div>
                    <label
                      htmlFor="customName"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Enter a new name:
                    </label>
                    <input
                      type="text"
                      id="customName"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      autoFocus
                      className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                    />
                  </div>
                )}

                {showOverwriteConfirm && (
                  <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
                    <p className="text-red-300 font-semibold mb-2">⚠️ Warning</p>
                    <p className="text-red-200 text-sm">
                      This will permanently replace your existing deck. This action cannot be undone.
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col space-y-2 pt-4">
                  {!isRenaming && !showOverwriteConfirm && (
                    <>
                      <button
                        onClick={onUseSuggestedName}
                        className="w-full px-4 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
                      >
                        Use This Name
                      </button>
                      <button
                        onClick={() => setIsRenaming(true)}
                        className="w-full px-4 py-3 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Rename
                      </button>
                      <button
                        onClick={handleOverwrite}
                        className="w-full px-4 py-3 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Overwrite Existing
                      </button>
                    </>
                  )}

                  {isRenaming && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setIsRenaming(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleRename}
                        disabled={!customName.trim()}
                        className="flex-1 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Confirm
                      </button>
                    </div>
                  )}

                  {showOverwriteConfirm && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setShowOverwriteConfirm(false)}
                        className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleOverwrite}
                        className="flex-1 px-4 py-2 bg-red-700 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Yes, Overwrite
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
