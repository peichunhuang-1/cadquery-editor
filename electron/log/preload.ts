import { ipcRenderer } from 'electron';

export const logAPI = {
    log: (message: string, level: string, hint?: string) => ipcRenderer.invoke('log:log', message, level, hint),
    onNotify: (func: Function) => ipcRenderer.on('log:notify', (_, message: string, level: string, hint?: string) => func(message, level, hint)),
    offNotify: (callback: any) => ipcRenderer.off('log:notify', callback),
};