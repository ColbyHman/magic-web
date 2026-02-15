import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { Deck, Folder } from '../types';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface DeleteFolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  folder: Folder | null;
  decksInFolder: Deck[];
  subfolders: Folder[];
  onDelete: (deleteContents: boolean) => void;
}

export const DeleteFolderModal: React.FC<DeleteFolderModalProps> = ({
  isOpen,
  onClose,
  folder,
  decksInFolder,
  subfolders,
  onDelete,
}) => {
  const [step, setStep] = useState<'choose' | 'confirm'>(folder ? 'choose' : 'choose');
  const [deleteContents, setDeleteContents] = useState(false);

  const hasContents = decksInFolder.length > 0 || subfolders.length > 0;

  const handleChooseOption = (withContents: boolean) => {
    setDeleteContents(withContents);
    if (withContents && hasContents) {
      setStep('confirm');
    } else {
      onDelete(withContents);
      handleClose();
    }
  };

  const handleConfirmDelete = () => {
    onDelete(deleteContents);
    handleClose();
  };

  const handleClose = () => {
    setStep('choose');
    setDeleteContents(false);
    onClose();
  };

  if (!folder) return null;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden pointer-events-auto border-2 border-red-600 border-opacity-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 border-b-2 border-red-600 border-opacity-50 z-10">
                <div className="flex items-center gap-3">
                  <ExclamationTriangleIcon className="w-7 h-7 text-red-400" />
                  <h2 className="text-2xl font-bold text-red-400">Delete Folder</h2>
                </div>
                <p className="text-gray-300 text-sm mt-1">
                  {step === 'choose' 
                    ? 'Choose how to delete this folder'
                    : 'Confirm deletion with contents'}
                </p>
              </div>

              {/* Content */}
              <div className="p-6">
                {step === 'choose' ? (
                  <>
                    <div className="mb-6">
                      <p className="text-white text-lg mb-2">
                        Delete folder "{folder.name}"?
                      </p>
                      {hasContents && (
                        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 border-opacity-30 rounded-lg p-4 mt-4">
                          <p className="text-yellow-400 text-sm mb-2">
                            This folder contains:
                          </p>
                          <ul className="text-gray-300 text-sm space-y-1 ml-4">
                            {decksInFolder.length > 0 && (
                              <li>• {decksInFolder.length} deck{decksInFolder.length !== 1 ? 's' : ''}</li>
                            )}
                            {subfolders.length > 0 && (
                              <li>• {subfolders.length} subfolder{subfolders.length !== 1 ? 's' : ''}</li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <button
                        onClick={() => handleChooseOption(false)}
                        className="w-full p-4 bg-blue-900 bg-opacity-30 border-2 border-blue-600 border-opacity-40 rounded-lg hover:bg-opacity-50 hover:border-opacity-60 transition-all text-left"
                      >
                        <div className="text-white font-semibold mb-1">
                          Delete folder only
                        </div>
                        <div className="text-gray-400 text-sm">
                          Move all decks and subfolders to the root level
                        </div>
                      </button>

                      <button
                        onClick={() => handleChooseOption(true)}
                        className="w-full p-4 bg-red-900 bg-opacity-30 border-2 border-red-600 border-opacity-40 rounded-lg hover:bg-opacity-50 hover:border-opacity-60 transition-all text-left"
                      >
                        <div className="text-white font-semibold mb-1">
                          Delete folder with contents
                        </div>
                        <div className="text-gray-400 text-sm">
                          Permanently delete folder, all decks inside, and all subfolders
                        </div>
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="mb-6">
                      <div className="bg-red-900 bg-opacity-30 border-2 border-red-600 border-opacity-50 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <ExclamationTriangleIcon className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-red-400 font-semibold mb-2">
                              Warning: This action cannot be undone!
                            </p>
                            <p className="text-gray-300 text-sm">
                              You are about to permanently delete the folder "{folder.name}" and all of its contents.
                            </p>
                          </div>
                        </div>
                      </div>

                      {decksInFolder.length > 0 && (
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                          <p className="text-white font-semibold mb-3">
                            Decks to be deleted ({decksInFolder.length}):
                          </p>
                          <ul className="space-y-2">
                            {decksInFolder.map(deck => (
                              <li key={deck.id} className="flex items-center gap-2 text-gray-300 text-sm">
                                <span className="text-red-400">•</span>
                                <span>{deck.name}</span>
                                <span className="text-gray-500 text-xs">
                                  ({deck.format}, {deck.cardCount} cards)
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {subfolders.length > 0 && (
                        <div className="bg-gray-800 bg-opacity-50 rounded-lg p-4 mt-3">
                          <p className="text-white font-semibold mb-2">
                            Subfolders to be deleted ({subfolders.length}):
                          </p>
                          <ul className="space-y-1">
                            {subfolders.map(subfolder => (
                              <li key={subfolder.id} className="flex items-center gap-2 text-gray-300 text-sm">
                                <span className="text-red-400">📁</span>
                                <span>{subfolder.name}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={handleConfirmDelete}
                        className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                      >
                        Yes, Delete Everything
                      </button>
                      <button
                        onClick={() => setStep('choose')}
                        className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Go Back
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              {step === 'choose' && (
                <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex justify-end">
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
