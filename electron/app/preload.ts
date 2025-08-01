import { ipcRenderer } from 'electron';

export const appAPI = {
    onAppCloseEvent: (func: Function) => ipcRenderer.on('app:close', (_, args: any) => {func(args)}), 
};