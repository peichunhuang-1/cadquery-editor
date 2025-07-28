import { create } from 'zustand';

type FileLocation = {
    folder: string;
    files: string[];
}


type FileStore = {
    fileList: FileLocation | null;
    setFileList: (fileLocation: FileLocation) => void;
    clearFileList: () => void;
};

export const useFileStore = create<FileStore>((set) => ({
    fileList: null,
    setFileList: (files) => set({ fileList: files }),
    clearFileList: () => set({ fileList: null }),
}));