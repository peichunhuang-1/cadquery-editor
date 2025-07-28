import { ipcRenderer } from 'electron';

export const fileAPI = {
    selectFolder: () => ipcRenderer.invoke('file:folder'),
    listFiles: (folder: string) => ipcRenderer.invoke('file:list', folder),
    readFile: (filePath: string) => ipcRenderer.invoke('file:read', filePath),
    writeFile: (filePath: string, content: string) => ipcRenderer.invoke('file:write', filePath, content),
    createFile: () => ipcRenderer.invoke('file:create'),
    onFolderEvent: (func: Function) => ipcRenderer.on('file:event', (_, { trigger, filename }) => {func(trigger, filename);}), 
    offFolderEvent: (callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void) => ipcRenderer.removeListener('file:event', callback),
};