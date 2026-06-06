import { create } from 'zustand';

/**
 * @fileOverview Global store to share files between tools (e.g., from Compressor to Unlocker).
 */

interface FileStore {
    sharedFile: File | null;
    setSharedFile: (file: File | null) => void;
}

export const useFileStore = create<FileStore>((set) => ({
    sharedFile: null,
    setSharedFile: (file) => set({ sharedFile: file }),
}));
