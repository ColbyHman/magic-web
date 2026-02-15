import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface ImportProgressModalProps {
  isOpen: boolean;
  current: number;
  total: number;
  currentCardName: string;
}

export const ImportProgressModal: React.FC<ImportProgressModalProps> = ({
  isOpen,
  current,
  total,
  currentCardName,
}) => {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
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
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 px-6 py-4 border-b-2 border-yellow-600 border-opacity-50">
                <h2 className="text-2xl font-bold text-yellow-400">Importing Deck</h2>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-sm text-gray-300 mb-2">
                    <span>Progress</span>
                    <span>{current} / {total} cards</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.3 }}
                      className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full rounded-full flex items-center justify-center"
                    >
                      <span className="text-xs font-semibold text-white">{percentage}%</span>
                    </motion.div>
                  </div>
                </div>

                {/* Current Card */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <p className="text-gray-400 text-sm mb-1">Currently importing:</p>
                  <p className="text-white font-semibold truncate">{currentCardName}</p>
                </div>

                {/* Loading Animation */}
                <div className="flex justify-center py-2">
                  <div className="flex space-x-2">
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-3 h-3 bg-yellow-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }}
                      className="w-3 h-3 bg-yellow-500 rounded-full"
                    />
                    <motion.div
                      animate={{ y: [0, -10, 0] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-3 h-3 bg-yellow-500 rounded-full"
                    />
                  </div>
                </div>

                <p className="text-center text-gray-400 text-sm">
                  Please wait while we fetch card data from Scryfall...
                </p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
