import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDeckStore } from '../store/deckStore';
import type { Deck, Format, Folder } from '../types';
import type { ImportProgress, ImportResult } from '../store/deckStore';
import { parseDeckList, type DeckPlatform } from '../utils/deckImportParser';
import { ImportDeckModal } from '../components/ImportDeckModal';
import { ImportProgressModal } from '../components/ImportProgressModal';
import { ValidationWarningModal } from '../components/ValidationWarningModal';
import { DeckNameConflictModal } from '../components/DeckNameConflictModal';
import { FailedCardsModal } from '../components/FailedCardsModal';
import { FolderPickerModal } from '../components/FolderPickerModal';
import { FolderContextMenu } from '../components/FolderContextMenu';
import { DeleteFolderModal } from '../components/DeleteFolderModal';
import CreateFolderModal from '../components/CreateFolderModal';
import styles from './Decks.module.css';

export default function Decks() {
  const navigate = useNavigate();
  
  const {
    decks,
    folders,
    currentFolderId,
    loadDecks,
    loadFolders,
    createDeck,
    deleteDeck,
    duplicateDeck,
    updateDeck,
    importDeck,
    savePendingDeck,
    setCurrentFolder,
    getFolderPath,
    getSubfolders,
    getDecksInFolder,
    createFolder,
    moveDecksToFolder,
    deleteFolder,
    renameFolder,
    updateFolderColor,
    moveFolder,
  } = useDeckStore();
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckFormat, setNewDeckFormat] = useState<Format>('standard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFormat, setFilterFormat] = useState<Format | 'all'>('all');
  
  // Bulk selection state
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedDeckIds, setSelectedDeckIds] = useState<string[]>([]);
  const [showFolderPicker, setShowFolderPicker] = useState(false);
  
  // Folder management state
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [showFolderContextMenu, setShowFolderContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [contextMenuFolder, setContextMenuFolder] = useState<Folder | null>(null);
  const [showDeleteFolderModal, setShowDeleteFolderModal] = useState(false);
  const [showMoveFolderModal, setShowMoveFolderModal] = useState(false);
  
  // Import state management
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress>({ current: 0, total: 0, currentCardName: '' });
  const [showValidationModal, setShowValidationModal] = useState(false);
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [showFailedCardsModal, setShowFailedCardsModal] = useState(false);
  const [pendingImportResult, setPendingImportResult] = useState<ImportResult | null>(null);
  
  useEffect(() => {
    loadDecks();
    loadFolders();
  }, [loadDecks, loadFolders]);
  
  const handleCreateDeck = () => {
    if (!newDeckName.trim()) return;
    
    const deck = createDeck(newDeckName.trim(), newDeckFormat, currentFolderId);
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
  
  // Bulk selection handlers
  const toggleDeckSelection = (deckId: string) => {
    setSelectedDeckIds(prev => 
      prev.includes(deckId) 
        ? prev.filter(id => id !== deckId)
        : [...prev, deckId]
    );
  };
  
  const exitSelectionMode = () => {
    setSelectionMode(false);
    setSelectedDeckIds([]);
  };
  
  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to delete ${selectedDeckIds.length} deck(s)?`)) {
      selectedDeckIds.forEach(id => deleteDeck(id));
      exitSelectionMode();
    }
  };
  
  const handleMoveToFolder = (folderId: string | null) => {
    moveDecksToFolder(selectedDeckIds, folderId);
    exitSelectionMode();
  };
  
  // Folder context menu handlers
  const handleFolderRightClick = (e: React.MouseEvent, folder: Folder) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuFolder(folder);
    setShowFolderContextMenu(true);
  };
  
  const handleRenameFolder = () => {
    if (!contextMenuFolder) return;
    const newName = prompt('Enter new folder name:', contextMenuFolder.name);
    if (newName && newName.trim() && newName.trim() !== contextMenuFolder.name) {
      renameFolder(contextMenuFolder.id, newName.trim());
    }
  };
  
  const handleChangeColor = () => {
    if (!contextMenuFolder) return;
    const newColor = prompt('Enter hex color (e.g., #ff6b6b):', contextMenuFolder.color || '');
    if (newColor !== null) {
      updateFolderColor(contextMenuFolder.id, newColor);
    }
  };
  
  const handleDeleteFolder = (deleteContents: boolean) => {
    if (!contextMenuFolder) return;
    deleteFolder(contextMenuFolder.id, deleteContents);
    setShowDeleteFolderModal(false);
    setContextMenuFolder(null);
  };
  
  const handleCreateSubfolder = () => {
    if (!contextMenuFolder) return;
    const name = prompt('Enter subfolder name:');
    if (name && name.trim()) {
      createFolder(name.trim(), contextMenuFolder.id);
    }
  };
  
  const handleMoveFolder = () => {
    if (!contextMenuFolder) return;
    setShowMoveFolderModal(true);
  };
  
  const handleMoveFolderToDestination = (destinationId: string | null) => {
    if (!contextMenuFolder) return;
    moveFolder(contextMenuFolder.id, destinationId);
    setShowMoveFolderModal(false);
    setContextMenuFolder(null);
  };
  
  const handleCreateNewFolder = (name: string, color?: string) => {
    createFolder(name, currentFolderId, color);
    setShowCreateFolderModal(false);
  };
  
  // Import handlers
  const handleImportDeck = async (deckName: string, format: Format, deckListText: string, platform: DeckPlatform) => {
    // Close import modal and show progress
    setShowImportModal(false);
    setShowProgressModal(true);
    
    // Parse the deck list
    const parsed = parseDeckList(deckListText, platform);
    
    // Import the deck with progress tracking
    const result = await importDeck(
      deckName,
      format,
      parsed.cards,
      (progress) => setImportProgress(progress)
    );
    
    // Hide progress modal
    setShowProgressModal(false);
    
    // Store result and handle next steps
    setPendingImportResult(result);
    
    if ('success' in result && result.success) {
      // Check for validation warnings/errors
      if (result.validation.warnings && result.validation.warnings.length > 0) {
        setShowValidationModal(true);
      } else {
        // Success with no issues
        alert(`Deck "${result.deck.name}" imported successfully!`);
        navigate(`/library/decks/${result.deck.id}`);
      }
    } else if ('conflict' in result && result.conflict) {
      // Name conflict - show conflict modal
      setShowConflictModal(true);
    } else if ('error' in result && result.error) {
      // Failed cards
      setShowFailedCardsModal(true);
    }
  };
  
  const handleValidationConfirm = () => {
    setShowValidationModal(false);
    if (pendingImportResult && 'success' in pendingImportResult && pendingImportResult.success) {
      // Save the deck now that user has confirmed
      savePendingDeck(pendingImportResult.deck);
      alert(`Deck "${pendingImportResult.deck.name}" imported successfully!`);
      navigate(`/library/decks/${pendingImportResult.deck.id}`);
    }
  };

  const handleValidationCancel = () => {
    setShowValidationModal(false);
    setPendingImportResult(null);
  };
  
  const handleConflictResolution = (action: 'suggested' | 'rename' | 'overwrite', newName?: string) => {
    setShowConflictModal(false);
    
    if (!pendingImportResult || !('conflict' in pendingImportResult)) return;
    
    const { pendingDeck, existingDeckId, suggestedName, validation } = pendingImportResult;
    
    let finalDeck = pendingDeck;
    let overwriteId: string | undefined;
    
    if (action === 'suggested') {
      finalDeck = { ...pendingDeck, name: suggestedName };
    } else if (action === 'rename' && newName) {
      finalDeck = { ...pendingDeck, name: newName };
    } else if (action === 'overwrite') {
      overwriteId = existingDeckId;
    }
    
    // Save the deck
    savePendingDeck(finalDeck, overwriteId);
    
    // Check if we need to show validation modal
    if (validation.warnings && validation.warnings.length > 0) {
      // Update pending result with the final deck
      setPendingImportResult({ success: true, deck: finalDeck, validation });
      setShowValidationModal(true);
    } else {
      alert(`Deck "${finalDeck.name}" imported successfully!`);
      navigate(`/library/decks/${overwriteId || finalDeck.id}`);
    }
  };
  
  const handleFailedCardsSkip = () => {
    setShowFailedCardsModal(false);
    
    if (!pendingImportResult || !('error' in pendingImportResult) || !pendingImportResult.partialDeck) return;
    
    const { partialDeck } = pendingImportResult;
    
    // Save the partial deck
    savePendingDeck(partialDeck);
    
    alert(`Deck "${partialDeck.name}" imported with some cards skipped.`);
    navigate(`/library/decks/${partialDeck.id}`);
  };
  
  // Filter decks - search globally but show folder path
  const filteredDecks = searchTerm 
    ? decks.filter(deck => deck.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : getDecksInFolder(currentFolderId);
  
  // Apply format filter
  const formatFilteredDecks = filterFormat === 'all' 
    ? filteredDecks 
    : filteredDecks.filter(deck => deck.format === filterFormat);
  
  // Sort: favorites first, then by updated date
  const sortedDecks = [...formatFilteredDecks].sort((a, b) => {
    if (a.isFavorite && !b.isFavorite) return -1;
    if (!a.isFavorite && b.isFavorite) return 1;
    return b.updatedAt.getTime() - a.updatedAt.getTime();
  });
  
  // Get current folders and path
  const currentFolders = getSubfolders(currentFolderId);
  const folderPath = getFolderPath(currentFolderId);
  
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
        
        {selectionMode ? (
          <div className={styles.selectionActions}>
            <span className={styles.selectionCount}>
              {selectedDeckIds.length} selected
            </span>
            <button 
              className={styles.bulkActionBtn}
              onClick={() => setShowFolderPicker(true)}
              disabled={selectedDeckIds.length === 0}
            >
              📁 Move to Folder
            </button>
            <button 
              className={`${styles.bulkActionBtn} ${styles.dangerBtn}`}
              onClick={handleBulkDelete}
              disabled={selectedDeckIds.length === 0}
            >
              🗑️ Delete
            </button>
            <button 
              className={styles.cancelBtn}
              onClick={exitSelectionMode}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              className={styles.selectBtn} 
              onClick={() => setSelectionMode(true)}
              disabled={sortedDecks.length === 0}
            >
              ☑️ Select Decks
            </button>
            <button className={styles.createBtn} onClick={() => setShowCreateFolderModal(true)}>
              📁 Create Folder
            </button>
            <button className={styles.createBtn} onClick={() => setShowImportModal(true)}>
              📥 Import Deck
            </button>
            <button className={styles.createBtn} onClick={() => setShowCreateModal(true)}>
              + Create New Deck
            </button>
          </div>
        )}
      </div>
      
      {/* Breadcrumb Navigation */}
      {(folderPath.length > 0 || currentFolderId !== null) && (
        <div className={styles.breadcrumbs}>
          <button 
            className={styles.breadcrumbItem}
            onClick={() => setCurrentFolder(null)}
          >
            All Decks
          </button>
          {folderPath.map((folder) => (
            <span key={folder.id}>
              <span className={styles.breadcrumbSeparator}>/</span>
              <button
                className={styles.breadcrumbItem}
                onClick={() => setCurrentFolder(folder.id)}
              >
                {folder.name}
              </button>
            </span>
          ))}
        </div>
      )}
      
      {/* Filters */}
      <div className={styles.filters}>
        <input
          type="text"
          className={styles.searchInput}
          placeholder={searchTerm ? "Searching all decks..." : "Search decks..."}
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
        {/* Folders */}
        {!searchTerm && currentFolders.map(folder => {
          const folderDeckCount = getDecksInFolder(folder.id).length;
          return (
            <div 
              key={folder.id} 
              className={styles.folderCard}
              onClick={() => setCurrentFolder(folder.id)}
              onContextMenu={(e) => handleFolderRightClick(e, folder)}
            >
              <div className={styles.folderIcon} style={folder.color ? { color: folder.color } : {}}>
                📁
              </div>
              <h3 className={styles.folderName}>{folder.name}</h3>
              <span className={styles.folderDeckCount}>
                {folderDeckCount} deck{folderDeckCount !== 1 ? 's' : ''}
              </span>
            </div>
          );
        })}
        
        {/* Decks */}
        {sortedDecks.length === 0 && currentFolders.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>🃏</div>
            <h2>{searchTerm ? 'No Decks Found' : 'No Decks Yet'}</h2>
            <p>{searchTerm ? 'Try a different search term' : 'Create your first deck to get started!'}</p>
            {!searchTerm && (
              <button className={styles.emptyCreateBtn} onClick={() => setShowCreateModal(true)}>
                Create Deck
              </button>
            )}
          </div>
        ) : (
          sortedDecks.map(deck => {
            const isSelected = selectedDeckIds.includes(deck.id);
            return (
            <div 
              key={deck.id} 
              className={`${styles.deckCard} ${selectionMode && isSelected ? styles.selected : ''}`}
              onClick={() => {
                if (selectionMode) {
                  toggleDeckSelection(deck.id);
                } else {
                  navigate(`/library/decks/${deck.id}`);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
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
              <div className={styles.deckInfo}>
                <h3 className={styles.deckName}>{deck.name}</h3>
                
                {/* Show folder path when searching */}
                {searchTerm && deck.folderId && (
                  <div className={styles.deckFolderPath}>
                    📁 {getFolderPath(deck.folderId).map(f => f.name).join(' / ')}
                  </div>
                )}
                
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
            );
          })
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
      
      {/* Import Modals */}
      <ImportDeckModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={handleImportDeck}
      />
      
      <ImportProgressModal
        isOpen={showProgressModal}
        current={importProgress.current}
        total={importProgress.total}
        currentCardName={importProgress.currentCardName}
      />
      
      {pendingImportResult && 'success' in pendingImportResult && pendingImportResult.success && (
        <ValidationWarningModal
          isOpen={showValidationModal}
          onClose={handleValidationCancel}
          validation={pendingImportResult.validation}
          deckName={pendingImportResult.deck.name}
          onImportAnyway={handleValidationConfirm}
        />
      )}
      
      {pendingImportResult && 'conflict' in pendingImportResult && pendingImportResult.conflict && (
        <DeckNameConflictModal
          isOpen={showConflictModal}
          onClose={() => setShowConflictModal(false)}
          existingDeckName={pendingImportResult.pendingDeck.name}
          suggestedName={pendingImportResult.suggestedName}
          onUseSuggestedName={() => handleConflictResolution('suggested')}
          onRename={(newName) => handleConflictResolution('rename', newName)}
          onOverwrite={() => handleConflictResolution('overwrite')}
        />
      )}
      
      {pendingImportResult && 'error' in pendingImportResult && pendingImportResult.error && (
        <FailedCardsModal
          isOpen={showFailedCardsModal}
          onClose={() => setShowFailedCardsModal(false)}
          failedCards={pendingImportResult.failedCards}
          onSkipAndContinue={handleFailedCardsSkip}
          hasPartialDeck={!!pendingImportResult.partialDeck}
        />
      )}

      {/* Folder Picker Modal */}
      <FolderPickerModal
        isOpen={showFolderPicker}
        onClose={() => setShowFolderPicker(false)}
        folders={folders}
        onSelectFolder={handleMoveToFolder}
        onCreateFolder={createFolder}
        currentFolderId={currentFolderId}
      />

      {/* Folder Context Menu */}
      <FolderContextMenu
        isOpen={showFolderContextMenu}
        position={contextMenuPosition}
        onClose={() => {
          setShowFolderContextMenu(false);
        }}
        onRename={handleRenameFolder}
        onChangeColor={handleChangeColor}
        onDelete={() => {
          setShowFolderContextMenu(false);
          if (!contextMenuFolder) return;
          
          const hasDecks = getDecksInFolder(contextMenuFolder.id).length > 0;
          const hasSubfolders = getSubfolders(contextMenuFolder.id).length > 0;
          
          if (hasDecks || hasSubfolders) {
            // Show modal to choose deletion method
            setShowDeleteFolderModal(true);
          } else {
            // Empty folder - delete immediately
            deleteFolder(contextMenuFolder.id, false);
            setContextMenuFolder(null);
          }
        }}
        onCreateSubfolder={handleCreateSubfolder}
        onMove={handleMoveFolder}
        folderName={contextMenuFolder?.name || ''}
      />

      {/* Delete Folder Modal */}
      <DeleteFolderModal
        isOpen={showDeleteFolderModal}
        onClose={() => {
          setShowDeleteFolderModal(false);
          setContextMenuFolder(null);
        }}
        folder={contextMenuFolder}
        decksInFolder={contextMenuFolder ? getDecksInFolder(contextMenuFolder.id) : []}
        subfolders={contextMenuFolder ? getSubfolders(contextMenuFolder.id) : []}
        onDelete={handleDeleteFolder}
      />

      {/* Move Folder Modal */}
      <FolderPickerModal
        isOpen={showMoveFolderModal}
        onClose={() => {
          setShowMoveFolderModal(false);
          setContextMenuFolder(null);
        }}
        folders={folders}
        onSelectFolder={handleMoveFolderToDestination}
        onCreateFolder={(name, parentId, color) => {
          const newFolder = createFolder(name, parentId, color);
          handleMoveFolderToDestination(newFolder.id);
        }}
        currentFolderId={contextMenuFolder?.id}
      />

      <CreateFolderModal
        isOpen={showCreateFolderModal}
        onClose={() => setShowCreateFolderModal(false)}
        onSubmit={handleCreateNewFolder}
        parentFolderName={currentFolderId ? getFolderPath(currentFolderId).map(f => f.name).join(' / ') : 'Root'}
      />
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
