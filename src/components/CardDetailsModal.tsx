import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

interface CardDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  cardName: string;
  imageUrl?: string;
}

interface ScryfallCard {
  name: string;
  mana_cost?: string;
  type_line: string;
  oracle_text?: string;
  power?: string;
  toughness?: string;
  image_uris?: {
    normal: string;
    large: string;
  };
  card_faces?: Array<{
    name: string;
    mana_cost?: string;
    type_line: string;
    oracle_text?: string;
    image_uris?: {
      normal: string;
      large: string;
    };
  }>;
  set_name?: string;
  rarity?: string;
  artist?: string;
}

export const CardDetailsModal: React.FC<CardDetailsModalProps> = ({
  isOpen,
  onClose,
  cardName,
  imageUrl,
}) => {
  const [cardData, setCardData] = React.useState<ScryfallCard | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Fetch card data when modal opens
  React.useEffect(() => {
    if (!isOpen || !cardName) return;

    const fetchCardData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url: string;
        
        // If we have an imageUrl, extract the card ID and fetch that specific printing
        if (imageUrl) {
          // Extract card ID from Scryfall URL (format: https://cards.scryfall.io/.../front/a/b/ab3d51a4-...jpg?1234)
          const match = imageUrl.match(/\/([a-f0-9-]{36})\//);
          if (match && match[1]) {
            url = `https://api.scryfall.com/cards/${match[1]}`;
          } else {
            // Fallback to fuzzy search
            url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`;
          }
        } else {
          // Use Scryfall's fuzzy search API
          url = `https://api.scryfall.com/cards/named?fuzzy=${encodeURIComponent(cardName)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error('Card not found');
        }
        
        const data: ScryfallCard = await response.json();
        setCardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch card data');
        console.error('Error fetching card data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCardData();
  }, [isOpen, cardName]);

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

  const content = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black bg-opacity-75 z-[200]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2, type: 'spring', damping: 25 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[201] w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-gray-900 via-green-900 to-gray-900 border-2 border-yellow-600 border-opacity-60 rounded-lg shadow-2xl backdrop-blur-sm bg-opacity-95 p-6">
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:text-yellow-400 transition-colors text-2xl font-bold"
              >
                ×
              </button>

              {loading && (
                <div className="text-center py-12">
                  <div className="text-white text-lg">Loading card details...</div>
                </div>
              )}

              {error && (
                <div className="text-center py-12">
                  <div className="text-red-400 text-lg mb-4">Error: {error}</div>
                  <button
                    onClick={onClose}
                    className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}

              {!loading && !error && cardData && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Card Image */}
                  <div className="flex justify-center items-start">
                    <img
                      src={cardData.image_uris?.large || cardData.card_faces?.[0]?.image_uris?.large}
                      alt={cardData.name}
                      className="rounded-lg shadow-xl max-w-full h-auto"
                    />
                  </div>

                  {/* Card Details */}
                  <div className="space-y-4 text-white">
                    <div>
                      <h2 className="text-3xl font-bold text-yellow-400 mb-2">
                        {cardData.name}
                      </h2>
                      {cardData.mana_cost && (
                        <div className="text-lg font-semibold text-gray-300">
                          {cardData.mana_cost}
                        </div>
                      )}
                    </div>

                    <div className="border-t border-yellow-600 border-opacity-30 pt-4">
                      <div className="font-semibold text-gray-400 mb-1">Type</div>
                      <div className="text-lg">{cardData.type_line}</div>
                    </div>

                    {cardData.oracle_text && (
                      <div className="border-t border-yellow-600 border-opacity-30 pt-4">
                        <div className="font-semibold text-gray-400 mb-1">Oracle Text</div>
                        <div className="text-sm leading-relaxed whitespace-pre-line">
                          {cardData.oracle_text}
                        </div>
                      </div>
                    )}

                    {(cardData.power || cardData.toughness) && (
                      <div className="border-t border-yellow-600 border-opacity-30 pt-4">
                        <div className="font-semibold text-gray-400 mb-1">Power / Toughness</div>
                        <div className="text-lg">
                          {cardData.power} / {cardData.toughness}
                        </div>
                      </div>
                    )}

                    {cardData.set_name && (
                      <div className="border-t border-yellow-600 border-opacity-30 pt-4">
                        <div className="font-semibold text-gray-400 mb-1">Set</div>
                        <div className="text-sm">{cardData.set_name}</div>
                      </div>
                    )}

                    {cardData.rarity && (
                      <div className="border-t border-yellow-600 border-opacity-30 pt-4">
                        <div className="font-semibold text-gray-400 mb-1">Rarity</div>
                        <div className="text-sm capitalize">{cardData.rarity}</div>
                      </div>
                    )}

                    {cardData.artist && (
                      <div className="border-t border-yellow-600 border-opacity-30 pt-4">
                        <div className="font-semibold text-gray-400 mb-1">Artist</div>
                        <div className="text-sm">{cardData.artist}</div>
                      </div>
                    )}
                  </div>
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
