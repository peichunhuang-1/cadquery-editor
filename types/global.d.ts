interface Window {
    api: {
        file: {
            selectFolder(): Promise<string | Error>;
            listFiles(folder: string): Promise<string[] | Error>;
            readFile(filePath: string): Promise<string | Error>;
            writeFile(filePath: string, content: string): Promise<void | Error>;
            createFile(): Promise<string | Error>;
            onFolderEvent(func: (trigger: string, filename: string)=>void): void;
            offFolderEvent(callback: (event: Electron.IpcRendererEvent, ...args: any[]) => void): void;
        };
    };
}