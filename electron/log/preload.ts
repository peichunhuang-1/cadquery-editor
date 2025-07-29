import { ipcRenderer } from 'electron';

export const logAPI = {
    log: (message: string, level: string) => ipcRenderer.invoke('log:log', message, level),
};