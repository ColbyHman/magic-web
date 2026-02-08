import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { ImportFailedCard } from '../store/deckStore';

interface FailedCardsModalProps {
  isOpen: boolean;
  onClose: () => void;
  failedCards: ImportFailedCard[];
  onSkipAndContinue: () => void;
  hasPartialDeck: boolean;
}

export const FailedCardsModal: React.FC<FailedCardsModalProps> = ({
  isOpen,
  onClose,
  failedCards,
  onSkipAndContinue,
  hasPartialDeck,
}) => {
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
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto pointer-events-auto border-2 border-red-600 border-opacity-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-red-900 to-red-800 px-6 py-4 border-b-2 border-red-600 border-opacity-50 z-10">
                <h2 className="text-2xl font-bold text-red-300">
                  {hasPartialDeck ? 'Some Cards Failed to Import' : 'Import Failed'}
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  {failedCards.length} card{failedCards.length !== 1 ? 's' : ''} could not be found
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                <p className="text-white">
                  The following cards could not be found in the Scryfall database:
                </p>

                {/* Failed Cards List */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
                  <ul className="divide-y divide-gray-700">
                    {failedCards.map((failedCard, index) => (
                      <li key={index} className="p-3">
                        <div className="flex items-start space-x-3">
                          <span className="text-red-400 text-xl">❌</span>
                          <div className="flex-1">
                            <p className="text-white font-semibold">{failedCard.cardName}</p>
                            <p className="text-gray-400 text-sm mt-1 font-mono">
                              {failedCard.originalLine}
                            </p>
                            <p className="text-red-300 text-sm mt-1">
                              {failedCard.error}
                            </p>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {hasPartialDeck && (
                  <div className="bg-blue-900 bg-opacity-30 border border-blue-600 rounded-lg p-4">
                    <p className="text-blue-200 text-sm">
                      <strong>Note:</strong> Some cards were successfully imported. You can skip the failed cards and import the rest, or cancel and try again.
                    </p>
                  </div>
                )}

                {!hasPartialDeck && (
                  <div className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-4">
                    <p className="text-red-200 text-sm">
                      <strong>Error:</strong> All cards failed to import. Please check your deck list format and try again.
                    </p>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel Import
                  </button>
                  {hasPartialDeck && (
                    <button
                      onClick={onSkipAndContinue}
                      className="flex-1 px-6 py-2 bg-blue-700 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                    >
                      Skip & Continue
                    </button>
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
