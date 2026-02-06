import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/deckStore';
import type { Deck, Format } from '../types';
import styles from './Decks.module.css';

export default function Decks() {
  const navigate = useNavigate();
  
  const {
    decks,
    loadDecks,
    createDeck,
    deleteDeck,
    duplicateDeck,
    updateDeck,
  } = useDeckStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<Format>('standard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState<Format | 'all'>('all');
  
  useEffect(() => {
    loadDecks();
  }, [loadDecks]);
  
  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    
    const deck = createDeck(newDeckName.trim(), newDeckFormat);
    setNewDeckName('');
    setShowCreateModal(false);
    navigate(`/library/decks/${deck.id}`);
  };
  
  const handleDeleteDeck = (deckId: string, deckName: string) => {
    if (confirm(`Are you sure you want to delete "${deckName}"?`)) {
      deleteDeck(deckId);
    }
  };
  
  const handleDuplicateDeck = (deckId: string) => {
    const duplicate = duplicateDeck(deckId);
    if (duplicate) {
      navigate(`/library/decks/${duplicate.id}`);
    }
  };
  
  const handleToggleFavorite = (deck: Deck) => {
    updateDeck(deck.id, { isFavorite: !deck.isFavorite });
  };
  
  // Filter decks
  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFormat = filterFormat === 'all' || deck.format === filterFormat;
    return matchesSearch && matchesFormat;
  });
  
  // Sort: favorites first, then by updated date
  const sortedDecks = [...filteredDecks].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  
  const getFormatBadgeClass = (format: Format) => {
    switch (format) {
      case 'standard': return styles.formatStandard;
      case 'commander': return styles.formatCommander;
      case 'modern': return styles.formatModern;
      case 'legacy': return styles.formatLegacy;
      case 'vintage': return styles.formatVintage;
      default: return styles.formatCasual;
    }
  };
  
  return (
    <div className={styles.decksPage}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>My Decks</h1>
          <span className={styles.deckCount}>{decks.length} deck{decks.length !== 1 ? 's' : ''}</span>
        </div>
        
        <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
          + Create New Deck
        </button>
      </div>
      
      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder="Search decks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <select
          className={styles.formatFilter}
          value={filterFormat}
          onChange={(e) => setFilterFormat(e.target.value as Format | 'all')}
        >
          <option value="all">All Formats</option>
          <option value="standard">Standard</option>
          <option value="commander">Commander</option>
          <option value="modern">Modern</option>
          <option value="legacy">Legacy</option>
          <option value="vintage">Vintage</option>
          <option value="casual">Casual</option>
        </select>
      </div>
      
      {/* Deck Grid */}
      <div className={styles.deckGrid}>
        {sortedDecks.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🃏</div>
            <h2>No Decks Yet</h2>
            <p>Create your first deck to get started!</p>
            <button className={styles.emptyCreateBtn} onClick={() => setShowCreateModal(true)}>
              Create Deck
            </button>
          </div>
        ) : (
          sortedDecks.map(deck => (
            <div key={deck.id} className={styles.deckCard}>
              {/* Favorite Button */}
              <button
                className={`${styles.favoriteBtn} ${deck.isFavorite ? styles.favorited : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleFavorite(deck);
                }}
                title={deck.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                {deck.isFavorite ? '★' : '☆'}
              </button>
              
              {/* Deck Info */}
              <div className={styles.deckInfo} onClick={() => navigate(`/library/decks/${deck.id}`)}>
                <h3 className={styles.deckName}>{deck.name}</h3>
                
                <div className={styles.deckMeta}>
                  <span className={`${styles.formatBadge} ${getFormatBadgeClass(deck.format)}`}>
                    {deck.format.charAt(0).toUpperCase() + deck.format.slice(1)}
                  </span>
                  <span className={styles.cardCount}>{deck.cardCount} cards</span>
                </div>
                
                {deck.colors && deck.colors.length > 0 && (
                  <div className={styles.colorIdentity}>
                    {deck.colors.map(color => (
                      <span key={color} className={styles.colorDot} style={{ background: getColorHex(color) }} />
                    ))}
                  </div>
                )}
                
                <div className={styles.deckFooter}>
                  <span className={styles.lastUpdated}>
                    Updated {formatDate(deck.updatedAt)}
                  </span>
                </div>
              </div>
              
              {/* Actions */}
              <div className={styles.deckActions}>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/library/decks/${deck.id}`);
                  }}
                  title="Edit deck"
                >
                  ✏️
                </button>
                <button
                  className={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDuplicateDeck(deck.id);
                  }}
                  title="Duplicate deck"
                >
                  📋
                </button>
                <button
                  className={`${styles.actionBtn} ${styles.deleteBtn}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteDeck(deck.id, deck.name);
                  }}
                  title="Delete deck"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Create Deck Modal */}
      {showCreateModal && (
        <div className={styles.modal} onClick={() => setShowCreateModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h2 className={styles.modalTitle}>Create New Deck</h2>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Deck Name</label>
              <input
                type="text"
                className={styles.input}
                placeholder="Enter deck name..."
                value={newDeckName}
                onChange={(e) => setNewDeckName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateDeck()}
                autoFocus
              />
            </div>
            
            <div className={styles.formGroup}>
              <label className={styles.label}>Format</label>
              <select
                className={styles.select}
                value={newDeckFormat}
                onChange={(e) => setNewDeckFormat(e.target.value as Format)}
              >
                <option value="standard">Standard</option>
                <option value="commander">Commander</option>
                <option value="modern">Modern</option>
                <option value="legacy">Legacy</option>
                <option value="vintage">Vintage</option>
                <option value="casual">Casual</option>
              </select>
            </div>
            
            <div className={styles.modalActions}>
              <button className={styles.cancelModalBtn} onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                className={styles.createModalBtn}
                onClick={handleCreateDeck}
                disabled={!newDeckName.trim()}
              >
                Create Deck
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function getColorHex(color: string): string {
  const colorMap: Record<string, string> = {
    W: '#f0f0c0',
    U: '#0080ff',
    B: '#4d4d4d',
    R: '#ff4040',
    G: '#40a040',
    C: '#cccccc',
  };
  return colorMap[color] || '#cccccc';
}

function formatDate(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString();
}
