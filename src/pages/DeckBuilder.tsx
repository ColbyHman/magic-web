import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/deckStore';
import CompactCardRow from '../components/CompactCardRow';
import { validateDeck, calculateDeckStats } from '../utils/deckValidation';
import type { DeckEntry, Format } from '../types';
import styles from './DeckBuilder.module.css';
import { 
  groupCardsByType, 
  getOrderedTypes, 
  calculateCMCDistribution,
  type SortOption 
} from '../utils/cardTypeUtils';

export default function DeckBuilder() {
  const { deckId } = useParams<{ deckId: string }>();
  const navigate = useNavigate();
  
  const {
    getDeckById,
    updateDeck,
    removeCardFromDeck,
    updateCardQuantity,
    removeCommander,
    addCardToDeck,
    setCommander,
    isAddingCard,
  } = useDeckStore();
  
  const deck = deckId ? getDeckById(deckId) : null;
  
  const [quickAddTerm, setQuickAddTerm] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [validationResult, setValidationResult] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [showValidation, setShowValidation] = useState(true);
  const [hoverCard, setHoverCard] = useState<DeckEntry | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sortOption, setSortOption] = useState<SortOption>('name-asc');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isCommanderSearch, setIsCommanderSearch] = useState(false);
  const [showFormatConfirm, setShowFormatConfirm] = useState(false);
  const [pendingFormat, setPendingFormat] = useState<Format | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    colors: [] as string[],
    colorIdentity: 'include' as 'include' | 'exact' | 'atmost',
    types: '',
    rarity: '',
    cmcMin: '',
    cmcMax: '',
    power: '',
    toughness: '',
    oracleText: '',
  });
  
  useEffect(() => {
    if (!deck) {
      navigate('/library/decks');
      return;
    }
    
    // Calculate validation and stats
    setValidationResult(validateDeck(deck));
    setStats(calculateDeckStats(deck));
  }, [deck, navigate]);
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  if (!deck) {
    return <div className={styles.loading}>Loading...</div>;
  }
  
  const commanders = deck.cards.filter(c => c.isCommander);
  const mainDeck = deck.cards.filter(c => !c.isSideboard && !c.isCommander);
  const sideboard = deck.cards.filter(c => c.isSideboard);
  
  // Group main deck cards by type
  const groupedMainDeck = groupCardsByType(mainDeck, sortOption);
  const orderedTypes = getOrderedTypes(groupedMainDeck);
  
  // Group sideboard cards by type
  const groupedSideboard = groupCardsByType(sideboard, sortOption);
  const orderedSideboardTypes = getOrderedTypes(groupedSideboard);
  
  // Calculate CMC distribution
  const cmcDistribution = calculateCMCDistribution(mainDeck);
  
  // Check which cards have validation warnings
  const cardsWithWarnings = new Set<string>();
  validationResult?.warnings.forEach((warning: any) => {
    warning.cardNames?.forEach((name: string) => cardsWithWarnings.add(name));
  });
  
  const handleQuickAdd = async () => {
    if (!quickAddTerm.trim() || isAddingCard) return;
    
    await addCardToDeck(deck.id, quickAddTerm.trim(), false);
    setQuickAddTerm('');
  };
  
  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    try {
      // Build query with filters
      let query = searchTerm;
      
      // Add color filters
      if (filters.colors.length > 0) {
        const colorStr = filters.colors.join('');
        if (filters.colorIdentity === 'exact') {
          query += ` c:${colorStr}`;
        } else if (filters.colorIdentity === 'include') {
          query += ` c>=${colorStr}`;
        } else if (filters.colorIdentity === 'atmost') {
          query += ` c<=${colorStr}`;
        }
      }
      
      // Add type filter
      if (filters.types.trim()) {
        query += ` t:${filters.types.trim()}`;
      }
      
      // Add rarity filter
      if (filters.rarity) {
        query += ` r:${filters.rarity}`;
      }
      
      // Add CMC filters
      if (filters.cmcMin) {
        query += ` cmc>=${filters.cmcMin}`;
      }
      if (filters.cmcMax) {
        query += ` cmc<=${filters.cmcMax}`;
      }
      
      // Add power filter
      if (filters.power) {
        query += ` pow${filters.power.includes('>') || filters.power.includes('<') || filters.power.includes('=') ? '' : '='}${filters.power}`;
      }
      
      // Add toughness filter
      if (filters.toughness) {
        query += ` tou${filters.toughness.includes('>') || filters.toughness.includes('<') || filters.toughness.includes('=') ? '' : '='}${filters.toughness}`;
      }
      
      // Add oracle text filter
      if (filters.oracleText.trim()) {
        query += ` o:${filters.oracleText.trim()}`;
      }
      
      const response = await fetch(
        `https://api.scryfall.com/cards/search?q=${encodeURIComponent(query)}`
      );
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.data || []);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    }
    setIsSearching(false);
  };
  
  const handleAddFromSearch = async (cardName: string, scryfallId: string) => {
    await addCardToDeck(deck.id, cardName, false);
    if (!isAddingCard && isCommanderSearch) {
      // Set as commander after adding
      setCommander(deck.id, scryfallId);
      setIsCommanderSearch(false);
    }
    if (!isAddingCard) {
      setShowSearchModal(false);
      setSearchTerm('');
      setSearchResults([]);
    }
  };
  
  const handleDeckNameChange = (newName: string) => {
    updateDeck(deck.id, { name: newName });
  };
  
  const handleFormatChange = (newFormat: Format) => {
    // If switching from commander to another format and there are commanders, confirm
    if (deck.format === 'commander' && newFormat !== 'commander' && commanders.length > 0) {
      setPendingFormat(newFormat);
      setShowFormatConfirm(true);
    } else {
      updateDeck(deck.id, { format: newFormat });
    }
  };
  
  const confirmFormatChange = () => {
    if (pendingFormat) {
      // Unset all commanders before changing format
      commanders.forEach(entry => {
        removeCommander(deck.id, entry.card.scryfallId);
      });
      updateDeck(deck.id, { format: pendingFormat });
    }
    setShowFormatConfirm(false);
    setPendingFormat(null);
  };
  
  const cancelFormatChange = () => {
    setShowFormatConfirm(false);
    setPendingFormat(null);
  };
  
  const toggleColor = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };
  
  const clearFilters = () => {
    setFilters({
      colors: [],
      colorIdentity: 'include',
      types: '',
      rarity: '',
      cmcMin: '',
      cmcMax: '',
      power: '',
      toughness: '',
      oracleText: '',
    });
  };
  
  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };
  
  // Calculate smart positioning for floating preview to keep it on screen
  const getPreviewPosition = () => {
    const PREVIEW_WIDTH = 250;
    const PREVIEW_HEIGHT = 350; // Approximate height
    const OFFSET = 10;
    const EDGE_PADDING = 10;
    
    let left = mousePos.x + OFFSET;
    let top = mousePos.y + OFFSET;
    
    // Check if preview would go off right edge
    if (left + PREVIEW_WIDTH + EDGE_PADDING > window.innerWidth) {
      left = mousePos.x - PREVIEW_WIDTH - OFFSET;
    }
    
    // Check if preview would go off bottom edge
    if (top + PREVIEW_HEIGHT + EDGE_PADDING > window.innerHeight) {
      top = mousePos.y - PREVIEW_HEIGHT - OFFSET;
    }
    
    // Ensure it doesn't go off left edge
    if (left < EDGE_PADDING) {
      left = EDGE_PADDING;
    }
    
    // Ensure it doesn't go off top edge
    if (top < EDGE_PADDING) {
      top = EDGE_PADDING;
    }
    
    return { left, top };
  };
  
  return (
    <div className={styles.deckBuilder}>
      {/* Header */}
      <div className={styles.header}>
        <button className={styles.backBtn} onClick={() => navigate('/library/decks')}>
          ← Back to Decks
        </button>
        
        <input
          type="text"
          className={styles.deckNameInput}
          value={deck.name}
          onChange={(e) => handleDeckNameChange(e.target.value)}
          placeholder="Deck Name"
        />
        
        <select
          className={styles.formatSelect}
          value={deck.format}
          onChange={(e) => handleFormatChange(e.target.value as Format)}
        >
          <option value="standard">Standard</option>
          <option value="commander">Commander</option>
          <option value="modern">Modern</option>
          <option value="legacy">Legacy</option>
          <option value="vintage">Vintage</option>
          <option value="casual">Casual</option>
        </select>
      </div>

      {/* Main Content */}
      <div className={`${styles.content} ${deck.format === 'commander' ? styles.withCommander : ''}`}>
        {/* Commander Sidebar (left) */}
        {deck.format === 'commander' && (
          <div className={styles.commanderSidebar}>
            <h3 className={styles.commanderTitle}>Commander</h3>
            {commanders.length === 0 ? (
              <div className={styles.commanderPlaceholder}>
                <div className={styles.placeholderContent}>
                  <p className={styles.placeholderText}>No commander selected</p>
                  <button 
                    className={styles.addCommanderBtn}
                    onClick={() => {
                      setIsCommanderSearch(true);
                      setShowSearchModal(true);
                    }}
                  >
                    + Add Commander
                  </button>
                </div>
              </div>
            ) : (
              commanders.map((entry) => (
                <div key={entry.card.scryfallId} className={styles.commanderCard}>
                  {entry.card.imageUrl && (
                    <img 
                      src={entry.card.imageUrl} 
                      alt={entry.card.name}
                      className={styles.commanderImage}
                    />
                  )}
                  <div className={styles.commanderDetails}>
                    <h4 className={styles.commanderName}>{entry.card.name}</h4>
                    {entry.card.manaCost && (
                      <div className={styles.commanderMana}>{entry.card.manaCost}</div>
                    )}
                    {entry.card.oracleText && (
                      <div className={styles.commanderText}>{entry.card.oracleText}</div>
                    )}
                  </div>
                  <button
                    className={styles.removeCommanderBtn}
                    onClick={() => removeCommander(deck.id, entry.card.scryfallId)}
                    title="Remove as commander"
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </div>
        )}
        
        {/* Left Section - Header + Deck Builder */}
        <div className={styles.leftSection}>
          {/* Left Panel - Card List */}
          <div className={styles.leftPanel}>
          {/* Validation Warnings */}
          {validationResult && validationResult.warnings.length > 0 && (
            <div className={styles.validationPanel}>
              <div className={styles.validationHeader} onClick={() => setShowValidation(!showValidation)}>
                <span>⚠️ Validation Warnings ({validationResult.warnings.length})</span>
                <button className={styles.toggleBtn}>{showValidation ? '▼' : '▶'}</button>
              </div>
              
              {showValidation && (
                <div className={styles.validationContent}>
                  {validationResult.warnings.map((warning: any, index: number) => (
                    <div key={index} className={styles.validationWarning}>
                      <div className={styles.warningMessage}>{warning.message}</div>
                      {warning.cardNames && warning.cardNames.length > 0 && (
                        <div className={styles.warningCards}>
                          {warning.cardNames.map((name: string) => (
                            <span key={name} className={styles.warningCard}>{name}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Quick Add Section */}
          <div className={styles.addCardSection}>
            <div className={styles.addCardForm}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="Quick Add..."
                value={quickAddTerm}
                onChange={(e) => setQuickAddTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                disabled={isAddingCard}
              />
              <button 
                className={styles.addBtn} 
                onClick={handleQuickAdd}
                disabled={isAddingCard || !quickAddTerm.trim()}
              >
                {isAddingCard ? 'Adding...' : 'Add'}
              </button>
              <button 
                className={styles.searchBtn} 
                onClick={() => setShowSearchModal(true)}
              >
                🔍 Search
              </button>
            </div>
          </div>
          
          {/* Sort Dropdown */}
          <div className={styles.sortSection}>
            <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
            <select
              id="sort-select"
              className={styles.sortSelect}
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as SortOption)}
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="cmc-asc">CMC (Low to High)</option>
              <option value="cmc-desc">CMC (High to Low)</option>
              <option value="color">Color</option>
            </select>
          </div>
          
          {/* Main Deck - Grouped by Type */}
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>
              {deck.format === 'commander' ? 'Lower 99' : 'Main Deck'} ({stats?.mainDeckCount || 0})
            </h3>
            
            {mainDeck.length === 0 ? (
              <div className={styles.emptyMessage}>No cards in deck</div>
            ) : (
              <div className={styles.typeSectionsGrid}>
                <div className={styles.typeSectionsColumn}>
                  {orderedTypes.map((type, index) => {
                    if (index % 2 !== 0) return null; // Only left column (even indices)
                    const typeCards = groupedMainDeck[type];
                    const sectionKey = `main-${type}`;
                    const isCollapsed = collapsedSections[sectionKey];
                    
                    return (
                      <div key={type} className={styles.typeSection}>
                        <div 
                          className={styles.typeSectionHeader}
                          onClick={() => toggleSection(sectionKey)}
                        >
                          <span className={styles.typeSectionTitle}>
                            {type} ({typeCards.reduce((sum, e) => sum + e.quantity, 0)})
                          </span>
                          <span className={styles.typeSectionToggle}>
                            {isCollapsed ? '▶' : '▼'}
                          </span>
                        </div>
                        
                        {!isCollapsed && (
                          <div className={styles.typeCardList}>
                            {typeCards.map((entry) => (
                              <CompactCardRow
                                key={entry.card.scryfallId}
                                entry={entry}
                                deckFormat={deck.format}
                                cardsWithWarnings={cardsWithWarnings}
                                onUpdateQuantity={(scryfallId, quantity) => updateCardQuantity(deck.id, scryfallId, quantity, false)}
                                onRemove={(scryfallId) => removeCardFromDeck(deck.id, scryfallId, false)}
                                onSetCommander={(scryfallId) => setCommander(deck.id, scryfallId)}
                                onHoverStart={(entry) => setHoverCard(entry)}
                                onHoverEnd={() => setHoverCard(null)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className={styles.typeSectionsColumn}>
                  {orderedTypes.map((type, index) => {
                    if (index % 2 === 0) return null; // Only right column (odd indices)
                    const typeCards = groupedMainDeck[type];
                    const sectionKey = `main-${type}`;
                    const isCollapsed = collapsedSections[sectionKey];
                    
                    return (
                      <div key={type} className={styles.typeSection}>
                        <div 
                          className={styles.typeSectionHeader}
                          onClick={() => toggleSection(sectionKey)}
                        >
                          <span className={styles.typeSectionTitle}>
                            {type} ({typeCards.reduce((sum, e) => sum + e.quantity, 0)})
                          </span>
                          <span className={styles.typeSectionToggle}>
                            {isCollapsed ? '▶' : '▼'}
                          </span>
                        </div>
                        
                        {!isCollapsed && (
                          <div className={styles.typeCardList}>
                            {typeCards.map((entry) => (
                              <CompactCardRow
                                key={entry.card.scryfallId}
                                entry={entry}
                                deckFormat={deck.format}
                                cardsWithWarnings={cardsWithWarnings}
                                onUpdateQuantity={(scryfallId, quantity) => updateCardQuantity(deck.id, scryfallId, quantity, false)}
                                onRemove={(scryfallId) => removeCardFromDeck(deck.id, scryfallId, false)}
                                onSetCommander={(scryfallId) => setCommander(deck.id, scryfallId)}
                                onHoverStart={(entry) => setHoverCard(entry)}
                                onHoverEnd={() => setHoverCard(null)}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          
          {/* Sideboard - Grouped by Type */}
          {deck.format !== 'commander' && (
            <div className={styles.section}>
              <h3 className={styles.sectionTitle}>
                Sideboard ({stats?.sideboardCount || 0})
              </h3>
              {sideboard.length === 0 ? (
                <div className={styles.emptyMessage}>No cards in sideboard</div>
              ) : (
                <div className={styles.typeSectionsGrid}>
                  <div className={styles.typeSectionsColumn}>
                    {orderedSideboardTypes.map((type, index) => {
                      if (index % 2 !== 0) return null; // Only left column
                      const typeCards = groupedSideboard[type];
                      const sectionKey = `sideboard-${type}`;
                      const isCollapsed = collapsedSections[sectionKey];
                  
                  return (
                    <div key={type} className={styles.typeSection}>
                      <div 
                        className={styles.typeSectionHeader}
                        onClick={() => toggleSection(sectionKey)}
                      >
                        <span className={styles.typeSectionTitle}>
                          {type} ({typeCards.reduce((sum, e) => sum + e.quantity, 0)})
                        </span>
                        <span className={styles.typeSectionToggle}>
                          {isCollapsed ? '▶' : '▼'}
                        </span>
                      </div>
                      
                      {!isCollapsed && (
                        <div className={styles.typeCardList}>
                          {typeCards.map((entry) => (
                            <div key={entry.card.scryfallId} className={styles.compactCardRow}>
                              <div className={styles.quantityControls}>
                                <button
                                  className={styles.quantityBtn}
                                  onClick={() => updateCardQuantity(deck.id, entry.card.scryfallId, entry.quantity - 1, true)}
                                  disabled={entry.quantity <= 1}
                                >
                                  −
                                </button>
                                <span className={styles.quantityDisplay}>{entry.quantity}</span>
                                <button
                                  className={styles.quantityBtn}
                                  onClick={() => updateCardQuantity(deck.id, entry.card.scryfallId, entry.quantity + 1, true)}
                                >
                                  +
                                </button>
                              </div>
                              <div className={styles.cardName}>
                                {entry.card.name}
                                {cardsWithWarnings.has(entry.card.name) && (
                                  <span className={styles.warningIcon} title="Validation warning">⚠️</span>
                                )}
                              </div>
                              <button
                                className={styles.removeCardBtn}
                                onClick={() => removeCardFromDeck(deck.id, entry.card.scryfallId, true)}
                                title="Remove card"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                    })}
                  </div>
                  <div className={styles.typeSectionsColumn}>
                    {orderedSideboardTypes.map((type, index) => {
                      if (index % 2 === 0) return null; // Only right column
                      const typeCards = groupedSideboard[type];
                      const sectionKey = `sideboard-${type}`;
                      const isCollapsed = collapsedSections[sectionKey];
                  
                      return (
                        <div key={type} className={styles.typeSection}>
                          <div 
                            className={styles.typeSectionHeader}
                            onClick={() => toggleSection(sectionKey)}
                          >
                            <span className={styles.typeSectionTitle}>
                              {type} ({typeCards.reduce((sum, e) => sum + e.quantity, 0)})
                            </span>
                            <span className={styles.typeSectionToggle}>
                              {isCollapsed ? '▶' : '▼'}
                            </span>
                          </div>
                          
                          {!isCollapsed && (
                            <div className={styles.typeCardList}>
                              {typeCards.map((entry) => (
                                <div key={entry.card.scryfallId} className={styles.compactCardRow}>
                                  <div className={styles.quantityControls}>
                                    <button
                                      className={styles.quantityBtn}
                                      onClick={() => updateCardQuantity(deck.id, entry.card.scryfallId, entry.quantity - 1, true)}
                                      disabled={entry.quantity <= 1}
                                    >
                                      −
                                    </button>
                                    <span className={styles.quantityDisplay}>{entry.quantity}</span>
                                    <button
                                      className={styles.quantityBtn}
                                      onClick={() => updateCardQuantity(deck.id, entry.card.scryfallId, entry.quantity + 1, true)}
                                    >
                                      +
                                    </button>
                                  </div>
                                  <div className={styles.cardName}>
                                    {entry.card.name}
                                    {cardsWithWarnings.has(entry.card.name) && (
                                      <span className={styles.warningIcon} title="Validation warning">⚠️</span>
                                    )}
                                  </div>
                                  <button
                                    className={styles.removeCardBtn}
                                    onClick={() => removeCardFromDeck(deck.id, entry.card.scryfallId, true)}
                                    title="Remove card"
                                  >
                                    ×
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        </div>
        
        {/* Right Panel - Stats */}
        <div className={styles.rightPanel}>
          <div className={styles.statsPanel}>
            <h3 className={styles.statsTitle}>Deck Statistics</h3>
            
            <div className={styles.stat}>
              <span className={styles.statLabel}>Total Cards:</span>
              <span className={styles.statValue}>{stats?.totalCards || 0}</span>
            </div>
            
            <div className={styles.stat}>
              <span className={styles.statLabel}>Average CMC:</span>
              <span className={styles.statValue}>{stats?.averageCMC?.toFixed(2) || '0.00'}</span>
            </div>
            
            {/* CMC Breakdown Bar Chart */}
            {Object.keys(cmcDistribution).length > 0 && (
              <div className={styles.cmcBreakdownSection}>
                <h4 className={styles.subsectionTitle}>CMC Breakdown</h4>
                <div className={styles.cmcBreakdown}>
                  {['1', '2', '3', '4', '5', '6', '7+'].map((cmcKey) => {
                    const count = cmcDistribution[cmcKey] || 0;
                    const maxCount = Math.max(...Object.values(cmcDistribution));
                    const widthPercent = maxCount > 0 ? (count / maxCount) * 100 : 0;
                    
                    return (
                      <div key={cmcKey} className={styles.cmcBreakdownRow}>
                        <span className={styles.cmcLabel}>{cmcKey}</span>
                        <div className={styles.cmcBarContainer}>
                          <div 
                            className={styles.cmcBar}
                            style={{ width: `${widthPercent}%` }}
                          />
                        </div>
                        <span className={styles.cmcCount}>{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Color Distribution */}
            {stats?.colorDistribution && Object.keys(stats.colorDistribution).length > 0 && (
              <div className={styles.colorSection}>
                <h4 className={styles.subsectionTitle}>Color Distribution</h4>
                <div className={styles.colorBars}>
                  {Object.entries(stats.colorDistribution).map(([color, count]: [string, any]) => (
                    <div key={color} className={styles.colorBar}>
                      <span className={styles.colorLabel}>{color}</span>
                      <div className={styles.colorBarFill} style={{ width: `${(count / stats.mainDeckCount) * 100}%` }} />
                      <span className={styles.colorCount}>{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Type Distribution */}
            {stats?.typeDistribution && Object.keys(stats.typeDistribution).length > 0 && (
              <div className={styles.typeSection}>
                <h4 className={styles.subsectionTitle}>Type Distribution</h4>
                <div className={styles.typeBars}>
                  {Object.entries(stats.typeDistribution)
                    .sort(([, a]: any, [, b]: any) => b - a)
                    .map(([type, count]: [string, any]) => (
                      <div key={type} className={styles.typeBar}>
                        <span className={styles.typeLabel}>{type}</span>
                        <span className={styles.typeCount}>{count}</span>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Format Change Confirmation Modal */}
      {showFormatConfirm && (
        <div className={styles.modalOverlay} onClick={cancelFormatChange}>
          <div className={styles.confirmModal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>Change Deck Format?</h3>
            <p className={styles.confirmMessage}>
              Changing from Commander format will move your commander{commanders.length > 1 ? 's' : ''} back to the main deck.
            </p>
            <div className={styles.confirmButtons}>
              <button className={styles.confirmBtn} onClick={confirmFormatChange}>
                Continue
              </button>
              <button className={styles.cancelBtn} onClick={cancelFormatChange}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Floating Hover Preview */}
      {hoverCard && (() => {
        const position = getPreviewPosition();
        return (
          <div 
            className={styles.floatingPreview}
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
            }}
          >
            {hoverCard.card.imageUrl && (
              <img 
                src={hoverCard.card.imageUrl} 
                alt={hoverCard.card.name}
                className={styles.floatingPreviewImage}
              />
            )}
          </div>
        );
      })()}

      {/* Search Modal */}
      {showSearchModal && (
        <div className={styles.modal} onClick={() => setShowSearchModal(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Search Scryfall</h2>
              <button className={styles.closeBtn} onClick={() => setShowSearchModal(false)}>
                ×
              </button>
            </div>
            
            <div className={styles.modalSearch}>
              <input
                type="text"
                className={styles.modalSearchInput}
                placeholder="Search by name, type, text..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                autoFocus
              />
              <button 
                className={styles.modalSearchBtn} 
                onClick={handleSearch}
                disabled={isSearching}
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            
            {/* Filters Section */}
            <div className={styles.filtersSection}>
              <div className={styles.filtersHeader} onClick={() => setShowFilters(!showFilters)}>
                <span className={styles.filtersTitle}>Advanced Filters</span>
                <span className={styles.filtersToggle}>{showFilters ? '▼' : '▶'}</span>
              </div>
              
              {showFilters && (
                <div className={styles.filtersContent}>
                  {/* Color Filters */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Colors</label>
                    <div className={styles.colorFilters}>
                      {['W', 'U', 'B', 'R', 'G'].map(color => (
                        <button
                          key={color}
                          className={`${styles.colorBtn} ${filters.colors.includes(color) ? styles.colorBtnActive : ''} ${styles[`color${color}`]}`}
                          onClick={() => toggleColor(color)}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                    <select
                      className={styles.filterSelect}
                      value={filters.colorIdentity}
                      onChange={(e) => setFilters({...filters, colorIdentity: e.target.value as any})}
                    >
                      <option value="include">Includes these colors</option>
                      <option value="exact">Exactly these colors</option>
                      <option value="atmost">At most these colors</option>
                    </select>
                  </div>
                  
                  {/* Type Filter */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Card Type</label>
                    <input
                      type="text"
                      className={styles.filterInput}
                      placeholder="e.g., creature, instant, planeswalker"
                      value={filters.types}
                      onChange={(e) => setFilters({...filters, types: e.target.value})}
                    />
                  </div>
                  
                  {/* Rarity Filter */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Rarity</label>
                    <select
                      className={styles.filterSelect}
                      value={filters.rarity}
                      onChange={(e) => setFilters({...filters, rarity: e.target.value})}
                    >
                      <option value="">Any</option>
                      <option value="common">Common</option>
                      <option value="uncommon">Uncommon</option>
                      <option value="rare">Rare</option>
                      <option value="mythic">Mythic</option>
                    </select>
                  </div>
                  
                  {/* CMC Filter */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Mana Value (CMC)</label>
                    <div className={styles.filterRange}>
                      <input
                        type="number"
                        className={styles.filterInputSmall}
                        placeholder="Min"
                        value={filters.cmcMin}
                        onChange={(e) => setFilters({...filters, cmcMin: e.target.value})}
                        min="0"
                      />
                      <span className={styles.filterRangeSeparator}>to</span>
                      <input
                        type="number"
                        className={styles.filterInputSmall}
                        placeholder="Max"
                        value={filters.cmcMax}
                        onChange={(e) => setFilters({...filters, cmcMax: e.target.value})}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  {/* Power/Toughness */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Power / Toughness</label>
                    <div className={styles.filterRange}>
                      <input
                        type="text"
                        className={styles.filterInputSmall}
                        placeholder="Power (e.g., 3, >=2)"
                        value={filters.power}
                        onChange={(e) => setFilters({...filters, power: e.target.value})}
                      />
                      <span className={styles.filterRangeSeparator}>/</span>
                      <input
                        type="text"
                        className={styles.filterInputSmall}
                        placeholder="Toughness"
                        value={filters.toughness}
                        onChange={(e) => setFilters({...filters, toughness: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  {/* Oracle Text */}
                  <div className={styles.filterGroup}>
                    <label className={styles.filterLabel}>Card Text</label>
                    <input
                      type="text"
                      className={styles.filterInput}
                      placeholder="Text on the card..."
                      value={filters.oracleText}
                      onChange={(e) => setFilters({...filters, oracleText: e.target.value})}
                    />
                  </div>
                  
                  <button className={styles.clearFiltersBtn} onClick={clearFilters}>
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
            
            <div className={styles.searchResults}>
              {isSearching && (
                <div className={styles.searchLoading}>Searching Scryfall...</div>
              )}
              
              {!isSearching && searchResults.length === 0 && searchTerm && (
                <div className={styles.noResults}>No cards found. Try a different search.</div>
              )}
              
              {!isSearching && searchResults.length === 0 && !searchTerm && (
                <div className={styles.noResults}>Enter a search term to find cards</div>
              )}
              
              {searchResults.map((card) => (
                <div key={card.id} className={styles.searchResultCard}>
                  <div className={styles.resultImage}>
                    {card.image_uris?.small ? (
                      <img src={card.image_uris.small} alt={card.name} />
                    ) : card.card_faces?.[0]?.image_uris?.small ? (
                      <img src={card.card_faces[0].image_uris.small} alt={card.name} />
                    ) : (
                      <div className={styles.noImage}>{card.name}</div>
                    )}
                  </div>
                  <div className={styles.resultInfo}>
                    <div className={styles.resultName}>{card.name}</div>
                    <div className={styles.resultType}>{card.type_line}</div>
                    {card.mana_cost && (
                      <div className={styles.resultMana}>{card.mana_cost}</div>
                    )}
                  </div>
                  <button
                    className={styles.resultAddBtn}
                    onClick={() => handleAddFromSearch(card.name, card.id)}
                    disabled={isAddingCard}
                  >
                    {isAddingCard ? '...' : '+'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
