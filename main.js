const path = require('path');
const fs = require('fs');
const resizeImg = require('resize-img');

const { app, BrowserWindow, Menu, ipcMain } = require('electron');

process.env.NODE_ENV = 'production';

const isMac = process.platform === 'darwin';
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

const menu = [
    ...(isMac ? [{
        label: app.name,
        submenu: [{
            label: 'About',
            click: createAboutWindow,
        }]
    }] : []),
    {
        role: 'fileMenu'
    },
    ...(!isMac ? [{
        label: 'Help',
        submenu: [{
            label: 'About',
            click: createAboutWindow,
        }]
    }] : [])
];

function createMainWindow() {
    mainWindow = new BrowserWindow({
        title: 'Image Resizer in Title',
        width: isDev ? 1125 : 500,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: true,
            contextIsolation: true,
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'renderer/index.html'));

    if (isDev) {
        mainWindow.webContents.openDevTools();
    }
    
    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

function createAboutWindow() {
    let aboutWindow = new BrowserWindow({
        title: 'About',
        width: 300,
        height: 300
    });

    aboutWindow.loadFile(path.join(__dirname, 'renderer/about.html'));
    aboutWindow.on('closed', () => {
        aboutWindow = null;
    });
}

function formatNumber(number) {
    return number < 10 ? `0${number}` : number;
}

function getDateTimeString() {
    const currDateTime = new Date();

    const day = formatNumber(currDateTime.getDate());
    const month = formatNumber(currDateTime.getMonth());
    const year = currDateTime.getFullYear();

    const hours = formatNumber(currDateTime.getHours());
    const minutes = formatNumber(currDateTime.getMinutes());
    const seconds = formatNumber(currDateTime.getSeconds());

    return `${day}${month}${year}_${hours}${minutes}${seconds}`;
}

async function resizeImage({ imgPath, imgWidth, imgHeight}) {
    try {
        const newImgPath = await resizeImg(fs.readFileSync(imgPath), {
            width: +imgWidth,
            height: +imgHeight
        });
        
        const currDateTimeStr = getDateTimeString();
        const newImgName = `${path.basename(imgPath).split('.')[0]}_resize_${currDateTimeStr}${path.extname(imgPath)}`;

        fs.writeFileSync(path.join(path.dirname(imgPath), newImgName), newImgPath);
        mainWindow.webContents.send('image_done');
    }
    
    catch (error) {
        console.log(error);
    }
}

ipcMain.on('image_resize', (e, options) => {
    resizeImage(options);
});

app.whenReady().then(() => {
    createMainWindow();

    const mainMenu = Menu.buildFromTemplate(menu);
    Menu.setApplicationMenu(mainMenu);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createMainWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (!isMac) {
        app.quit();
    }
});