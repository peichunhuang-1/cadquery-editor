import { createRequire } from 'node:module'
import { promises as fs } from 'fs';
import chokidar from 'chokidar';
const require = createRequire(import.meta.url)
const { dialog } = require('electron')

import { ipcMain } from 'electron';

let stopEventListener: (() => Promise<void>) = () => {return Promise.resolve()};

async function OpenFolderDialog(): Promise<string | Error> {
    try {
        const result = await dialog.showOpenDialog({ properties: ['createDirectory', 'openDirectory'] });
        return result.filePaths[0];
    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
        return new Error(String(err));
    }
}

async function GetFileNamesInFolder(sender: any, folder: string): Promise<string[] | Error> {
    try {
        await stopEventListener();
        stopEventListener = ListenFolder(folder, (trigger: string, filename: string)=>{
            sender.send('file:event', {trigger, filename});
        });
        const entries = await fs.readdir(folder, { withFileTypes: true });
        const files = entries
            .filter((entry) => entry.isFile())
            .map((file) => file.name);
        return files;
    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
        return new Error(String(err));
    }
}

async function GetFileContent(filePath: string): Promise<string | Error> {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
        return new Error(String(err));
    }
}

async function WriteFileContent(filePath: string, content: string) : Promise<void | Error> {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        return;
    } catch (err: unknown) {
        if (err instanceof Error) {
            return err;
        }
        return new Error(String(err));
    }
}

async function OpenFileDialog() : Promise<string | Error> {
    try {
        const result = await dialog.showSaveDialog({properties: ['createDirectory']});
        const filePath = result.filePath;
        if (result.canceled === true || filePath === "") return "";
        if (!filePath) return new Error("Invalid file path");
        await fs.writeFile(filePath, '');
        return filePath;
    } catch (err: unknown) {
        if ( err instanceof Error) {
            return err;
        }
        return new Error(String(err));
    }
}
type ChangeCallback = (event: 'add' | 'delete', filename: string) => void;
function ListenFolder(folderPath: string, onChange: ChangeCallback): ()=>Promise<void> {
    const watcher = chokidar.watch(folderPath, {ignoreInitial: true, persistent: true});
    watcher.on('add', (path)=>{onChange('add', path);});
    watcher.on('unlink', (path)=>{onChange('delete', path);});
    return async ()=>{await watcher.close()};
}

export function registFileOperationIpc() {
    ipcMain.handle('file:folder', async (_) => {
        return await OpenFolderDialog();
    });
    ipcMain.handle('file:list', async (event, folder: string) => {
        return await GetFileNamesInFolder(event.sender, folder);
    });
    ipcMain.handle('file:read', async (_, filePath: string) => {
        return await GetFileContent(filePath);
    });
    ipcMain.handle('file:write', async (_, filePath: string, content: string) => {
        return await WriteFileContent(filePath, content);
    });
    ipcMain.handle('file:create', async (_) => {
        return await OpenFileDialog();
    });
}
