import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { Format } from '../types';
import { parseDeckList, type DeckPlatform } from '../utils/deckImportParser';

interface ImportDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (deckName: string, format: Format, deckListText: string, platform: DeckPlatform) => void;
}

export const ImportDeckModal: React.FC<ImportDeckModalProps> = ({
  isOpen,
  onClose,
  onImport,
}) => {
  const [deckListText, setDeckListText] = useState('');
  const [format, setFormat] = useState<Format>('casual');
  const [deckName, setDeckName] = useState('');
  const [platform, setPlatform] = useState<DeckPlatform>('archidekt');
  const [parsedName, setParsedName] = useState<string | undefined>();

  // Parse deck name from pasted text
  useEffect(() => {
    if (deckListText.trim()) {
      const parsed = parseDeckList(deckListText, platform);
      setParsedName(parsed.deckName);
      if (parsed.deckName && !deckName) {
        setDeckName(parsed.deckName);
      }
    }
  }, [deckListText, platform]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setDeckListText('');
      setFormat('casual');
      setDeckName('');
      setPlatform('archidekt');
      setParsedName(undefined);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalDeckName = deckName.trim() || parsedName || 'Imported Deck';
    onImport(finalDeckName, format, deckListText, platform);
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
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto pointer-events-auto border-2 border-yellow-600 border-opacity-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-yellow-900 to-yellow-800 px-6 py-4 border-b-2 border-yellow-600 border-opacity-50 z-10">
                <h2 className="text-2xl font-bold text-yellow-400">Import Deck</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Paste your deck list from your chosen platform
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column - Deck List Text Area */}
                  <div className="lg:col-span-1">
                    <label
                      htmlFor="deckList"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Deck List
                    </label>
                    <textarea
                      id="deckList"
                      value={deckListText}
                      onChange={(e) => setDeckListText(e.target.value)}
                      placeholder={platform === 'archidekt' 
                        ? "Paste your Archidekt deck list here...\n\nExample:\n4x Lightning Bolt (2XM) 97\n4 Counterspell (MH2) 267\n1 Sol Ring (C21) 263 [Commander]"
                        : "Paste your Moxfield deck list here...\n\nExample:\n4 Lightning Bolt (2XM) 97\n4 Counterspell (MH2) 267\nCommander:\n1 Atraxa, Praetors' Voice (C16) 28"}
                      rows={16}
                      required
                      className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent font-mono text-sm resize-none"
                    />
                    <p className="text-xs text-gray-400 mt-2">
                      {platform === 'archidekt' 
                        ? `Format: {quantity}x {name} ({set}) {collector number} [{category}]`
                        : `Format: {quantity} {name} ({set}) {collector number}`}
                    </p>
                  </div>

                  {/* Right Column - Form Fields and Buttons */}
                  <div className="lg:col-span-1 space-y-4">

                    {/* Deck Name */}
                    <div>
                      <label
                        htmlFor="deckName"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Deck Name
                      </label>
                      <input
                        type="text"
                        id="deckName"
                        value={deckName}
                        onChange={(e) => setDeckName(e.target.value)}
                        placeholder={parsedName || 'Enter deck name or it will be auto-detected'}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      />
                      {parsedName && !deckName && (
                        <p className="text-sm text-gray-400 mt-1">
                          Detected: "{parsedName}"
                        </p>
                      )}
                    </div>

                    {/* Platform */}
                    <div>
                      <label
                        htmlFor="platform"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Source Platform
                      </label>
                      <select
                        id="platform"
                        value={platform}
                        onChange={(e) => setPlatform(e.target.value as DeckPlatform)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="archidekt">Archidekt</option>
                        <option value="moxfield">Moxfield</option>
                      </select>
                    </div>

                    {/* Format */}
                    <div>
                      <label
                        htmlFor="format"
                        className="block text-sm font-medium text-gray-300 mb-2"
                      >
                        Format
                      </label>
                      <select
                        id="format"
                        value={format}
                        onChange={(e) => setFormat(e.target.value as Format)}
                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      >
                        <option value="standard">Standard</option>
                        <option value="commander">Commander</option>
                        <option value="modern">Modern</option>
                        <option value="legacy">Legacy</option>
                        <option value="vintage">Vintage</option>
                        <option value="casual">Casual</option>
                      </select>
                    </div>

                    {/* Buttons */}
                    <div className="flex flex-col space-y-3 pt-4">
                      <button
                        type="submit"
                        disabled={!deckListText.trim()}
                        className="w-full px-6 py-3 bg-yellow-600 hover:bg-yellow-500 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Import Deck
                      </button>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
