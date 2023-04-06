// Modules to control application life and create native browser window
const { app, BrowserWindow, globalShortcut, ipcMain, clipboard, Notification, Menu } = require('electron');
const path = require('path');


let mainWindow;

function notification(title = "GTP-Desktop", message) {
    new Notification({
        title: title,
        body: message,
        icon: 'img/gpt-logo.jpg',
        onClickFunc: function() {
            console.log('알림 클릭됨');
        }
    }).show();
}

function createWindow() {
    mainWindow = new BrowserWindow({
        title: 'GTP-Desktop',
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            // nodeIntegration: true,
        }
    });

    mainWindow.loadURL('https://chat.openai.com/chat');
    Menu.setApplicationMenu(null);
}

if (process.platform === 'win32') {
    app.setAppUserModelId("GPT Desktop");
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.on('gpt-answer', (event, text) => {
        console.log("[GPT] --------------------------------------------\n", text);
        notification(text);
    });

    app.on('activate', function() {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.setTitle("GPT-Desktop");
    });
});

app.on('window-all-closed', function() {
    if (process.platform !== 'darwin') app.quit();
});

app.on('ready', () => {
    globalShortcut.register('Ctrl+Shift+Alt+`', () => {
        mainWindow.webContents.focus();
        const clipboardText = clipboard.readText() + "\n200자 이내로 답해줘.";
        console.log("[YOU] --------------------------------------------\n", clipboardText);
        mainWindow.webContents.send("focus-input", clipboardText);

    });
});

app.on('will-quit', () => {
    globalShortcut.unregisterAll();
});
