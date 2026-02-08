import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { ValidationResult } from '../types';

interface ValidationWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  validation: ValidationResult;
  deckName: string;
  onImportAnyway: () => void;
}

export const ValidationWarningModal: React.FC<ValidationWarningModalProps> = ({
  isOpen,
  onClose,
  validation,
  deckName,
  onImportAnyway,
}) => {
  const hasWarnings = validation.warnings && validation.warnings.length > 0;
  const hasErrors = validation.warnings?.some(w => w.severity === 'error');

  if (!hasWarnings) {
    return null;
  }

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
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-lg w-full max-h-[80vh] overflow-y-auto pointer-events-auto border-2 border-yellow-600 border-opacity-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-yellow-900 to-yellow-800 px-6 py-4 border-b-2 border-yellow-600 border-opacity-50 z-10">
                <h2 className="text-2xl font-bold text-yellow-400">
                  {hasErrors ? 'Deck Validation Issues' : 'Deck Validation Warnings'}
                </h2>
                <p className="text-gray-300 text-sm mt-1">
                  {deckName}
                </p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-4">
                {hasErrors && (
                  <div>
                    <h3 className="text-red-400 font-semibold text-lg mb-3 flex items-center">
                      <span className="mr-2">❌</span>
                      Errors
                    </h3>
                    <ul className="space-y-2">
                      {validation.warnings
                        .filter(w => w.severity === 'error')
                        .map((warning, index) => (
                          <li
                            key={index}
                            className="bg-red-900 bg-opacity-30 border border-red-600 rounded-lg p-3 text-red-200 text-sm"
                          >
                            {warning.message}
                            {warning.cardNames && warning.cardNames.length > 0 && (
                              <div className="mt-2 text-xs">
                                Cards: {warning.cardNames.join(', ')}
                              </div>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.some(w => w.severity === 'warning') && (
                  <div>
                    <h3 className="text-yellow-400 font-semibold text-lg mb-3 flex items-center">
                      <span className="mr-2">⚠️</span>
                      Warnings
                    </h3>
                    <ul className="space-y-2">
                      {validation.warnings
                        .filter(w => w.severity === 'warning')
                        .map((warning, index) => (
                          <li
                            key={index}
                            className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-3 text-yellow-200 text-sm"
                          >
                            {warning.message}
                            {warning.cardNames && warning.cardNames.length > 0 && (
                              <div className="mt-2 text-xs">
                                Cards: {warning.cardNames.join(', ')}
                              </div>
                            )}
                          </li>
                        ))}
                    </ul>
                  </div>
                )}

                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 mt-4">
                  <p className="text-gray-300 text-sm">
                    {hasErrors
                      ? 'This deck has validation errors. You can still import it, but it may not be legal for competitive play.'
                      : 'This deck has some warnings but can still be imported.'}
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex space-x-3 pt-4 border-t border-gray-700">
                  <button
                    onClick={onClose}
                    className="flex-1 px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onImportAnyway}
                    className="flex-1 px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors"
                  >
                    Import Anyway
                  </button>
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
