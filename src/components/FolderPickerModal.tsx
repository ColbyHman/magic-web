import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import type { Folder } from '../types';
import { ChevronRightIcon, ChevronDownIcon, FolderIcon, FolderPlusIcon } from '@heroicons/react/24/outline';

interface FolderPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onSelectFolder: (folderId: string | null) => void;
  onCreateFolder: (name: string, parentId: string | null, color?: string) => void;
  currentFolderId?: string | null;
}

export const FolderPickerModal: React.FC<FolderPickerModalProps> = ({
  isOpen,
  onClose,
  folders,
  onSelectFolder,
  onCreateFolder,
  currentFolderId,
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createInFolderId, setCreateInFolderId] = useState<string | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('');

  const toggleExpanded = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      onCreateFolder(newFolderName.trim(), createInFolderId, newFolderColor || undefined);
      setNewFolderName('');
      setNewFolderColor('');
      setShowCreateForm(false);
      setCreateInFolderId(null);
    }
  };

  const handleSelectFolder = (folderId: string | null) => {
    onSelectFolder(folderId);
    onClose();
  };

  const startCreateFolder = (parentId: string | null) => {
    setCreateInFolderId(parentId);
    setShowCreateForm(true);
  };

  const getSubfolders = (parentId: string | null): Folder[] => {
    return folders.filter(f => f.parentId === parentId).sort((a, b) => a.name.localeCompare(b.name));
  };

  const renderFolderTree = (parentId: string | null, depth: number = 0) => {
    const subfolders = getSubfolders(parentId);
    
    return subfolders.map(folder => {
      const isExpanded = expandedFolders.has(folder.id);
      const hasChildren = getSubfolders(folder.id).length > 0;
      const isDisabled = folder.id === currentFolderId;

      return (
        <div key={folder.id} style={{ marginLeft: depth > 0 ? '16px' : '0' }}>
          <div 
            className={`flex items-center gap-2 p-3 rounded-lg transition-all ${
              isDisabled 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-white hover:bg-opacity-5 cursor-pointer'
            }`}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleExpanded(folder.id)}
                className="p-1 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
              >
                {isExpanded ? (
                  <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ) : (
              <div className="w-6" />
            )}
            
            <button
              onClick={() => !isDisabled && handleSelectFolder(folder.id)}
              disabled={isDisabled}
              className="flex-1 flex items-center gap-2 text-left"
            >
              <span 
                className="text-2xl"
                style={folder.color ? { color: folder.color } : {}}
              >
                📁
              </span>
              <span className="text-white">{folder.name}</span>
            </button>

            <button
              onClick={() => startCreateFolder(folder.id)}
              className="p-2 hover:bg-white hover:bg-opacity-10 rounded transition-colors"
              title="Create subfolder"
            >
              <FolderPlusIcon className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {isExpanded && renderFolderTree(folder.id, depth + 1)}
          
          {showCreateForm && createInFolderId === folder.id && (
            <div className="ml-4 p-3 bg-gray-800 bg-opacity-50 rounded-lg mb-2 border border-purple-600 border-opacity-20">
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                autoFocus
              />
              <div className="flex items-center gap-3 mb-3">
                <label className="text-sm font-medium text-gray-300">Color (optional):</label>
                <input
                  type="color"
                  value={newFolderColor}
                  onChange={(e) => setNewFolderColor(e.target.value)}
                  className="w-12 h-10 rounded cursor-pointer bg-gray-900 border border-gray-700"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCreateFolder}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition-colors"
                >
                  Create
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setNewFolderName('');
                    setNewFolderColor('');
                    setCreateInFolderId(null);
                  }}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      );
    });
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
              className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-lg shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden pointer-events-auto border-2 border-purple-600 border-opacity-30"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-purple-900 to-purple-800 px-6 py-4 border-b-2 border-purple-600 border-opacity-50 z-10">
                <h2 className="text-2xl font-bold text-purple-400">Move to Folder</h2>
                <p className="text-gray-300 text-sm mt-1">
                  Select a destination folder or create a new one
                </p>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                {/* Root option */}
                <div 
                  className={`flex items-center gap-2 p-3 rounded-lg mb-2 transition-all ${
                    currentFolderId === null 
                      ? 'opacity-50 cursor-not-allowed' 
                      : 'hover:bg-white hover:bg-opacity-5 cursor-pointer'
                  }`}
                  onClick={() => currentFolderId !== null && handleSelectFolder(null)}
                >
                  <div className="w-6" />
                  <FolderIcon className="w-6 h-6 text-gray-400" />
                  <span className="text-white">All Decks (Root)</span>
                </div>

                <button
                  onClick={() => startCreateFolder(null)}
                  className="w-full flex items-center gap-2 p-3 rounded-lg mb-4 bg-purple-900 bg-opacity-20 hover:bg-opacity-30 border border-purple-600 border-opacity-30 hover:border-opacity-50 transition-all text-left"
                >
                  <div className="w-6" />
                  <FolderPlusIcon className="w-5 h-5 text-purple-400" />
                  <span className="text-purple-400">Create New Folder</span>
                </button>

                {showCreateForm && createInFolderId === null && (
                  <div className="p-4 bg-gray-800 bg-opacity-50 rounded-lg mb-4 border border-purple-600 border-opacity-20">
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Folder name"
                      className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent mb-3"
                      autoFocus
                    />
                    <div className="flex items-center gap-3 mb-3">
                      <label className="text-sm font-medium text-gray-300">Color (optional):</label>
                      <input
                        type="color"
                        value={newFolderColor}
                        onChange={(e) => setNewFolderColor(e.target.value)}
                        className="w-12 h-10 rounded cursor-pointer bg-gray-900 border border-gray-700"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCreateFolder}
                        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded transition-colors"
                      >
                        Create
                      </button>
                      <button
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewFolderName('');
                          setNewFolderColor('');
                        }}
                        className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {/* Folder tree */}
                <div className="space-y-1">
                  {renderFolderTree(null)}
                </div>

                {folders.length === 0 && !showCreateForm && (
                  <div className="text-center py-8 text-gray-400">
                    <FolderIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No folders yet. Create one to get started!</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 bg-gray-900 border-t border-gray-700 flex justify-end">
                <button
                  onClick={onClose}
                  className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(content, document.body);
};
