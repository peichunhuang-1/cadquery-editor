import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import { ipcMain } from 'electron';

const transport: DailyRotateFile = new DailyRotateFile({
    filename: 'cadquery-editor-%DATE%.log',
    datePattern: 'YYYY-MM-DD-HH',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
    dirname: process.env.LOG_DIR || '.',
});

var logger = winston.createLogger({
    level: 'info',
    transports: [
      transport,
    ]
});

function log(event: Electron.IpcMainInvokeEvent, message: string, level: string, hint?: string) {
    logger.log(level, message);
    if (hint) event.sender.send('log:notify', message, level, hint);
}

export function registLogIpc() {
    ipcMain.handle('log:log', (event: Electron.IpcMainInvokeEvent, message: string, level: string, hint?: string) => {
        log(event, message, level, hint);
    });
}