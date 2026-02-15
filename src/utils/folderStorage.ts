import type { Folder } from '../types';

const STORAGE_KEY = 'mtg-folders';

/**
 * Save folders to localStorage
 */
export function saveFolders(folders: Folder[]): void {
  try {
    // Convert dates to ISO strings for storage
    const serialized = folders.map(folder => ({
      ...folder,
      createdAt: folder.createdAt.toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (error) {
    console.error('Failed to save folders to localStorage:', error);
  }
}

/**
 * Load folders from localStorage
 */
export function loadFolders(): Folder[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }
    
    const parsed = JSON.parse(stored);
    
    // Convert ISO strings back to Date objects
    return parsed.map((folder: any) => ({
      ...folder,
      createdAt: new Date(folder.createdAt),
    }));
  } catch (error) {
    console.error('Failed to load folders from localStorage:', error);
    return [];
  }
}

/**
 * Save a single folder (updates existing or adds new)
 */
export function saveFolder(folder: Folder): void {
  const folders = loadFolders();
  const index = folders.findIndex(f => f.id === folder.id);
  
  if (index >= 0) {
    folders[index] = folder;
  } else {
    folders.push(folder);
  }
  
  saveFolders(folders);
}

/**
 * Delete a folder by ID
 */
export function deleteFolder(folderId: string): void {
  const folders = loadFolders();
  const filtered = folders.filter(f => f.id !== folderId);
  saveFolders(filtered);
}

/**
 * Get a single folder by ID
 */
export function getFolder(folderId: string): Folder | null {
  const folders = loadFolders();
  return folders.find(f => f.id === folderId) || null;
}
