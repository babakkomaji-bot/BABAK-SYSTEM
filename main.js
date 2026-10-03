const { app, BrowserWindow, Menu, ipcMain, screen, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let posWindow = null;
let customerWindow = null;

function createPosWindow(){
  posWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    autoHideMenuBar: true,
    title: 'سامانه بابک | صندوق فروش',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  posWindow.loadFile(path.join(__dirname, 'index.html'));
}

function createCustomerWindow(){
  const displays = screen.getAllDisplays();
  const primary = screen.getPrimaryDisplay();
  const external = displays.find(d => d.id !== primary.id);

  const options = {
    autoHideMenuBar: true,
    title: 'سامانه بابک | نمایشگر مشتری',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  };

  if(external){
    // A second monitor / touch screen was detected: place the customer
    // display there and make it fullscreen automatically.
    options.x = external.bounds.x;
    options.y = external.bounds.y;
    options.width = external.bounds.width;
    options.height = external.bounds.height;
  } else {
    // Only one screen found: open as a normal window the shopkeeper can
    // drag onto the touch monitor once it is connected, then press
    // "تمام‌صفحه" on the screen itself.
    options.width = 900;
    options.height = 600;
  }

  customerWindow = new BrowserWindow(options);
  customerWindow.loadFile(path.join(__dirname, 'customer-display.html'));

  if(external){
    customerWindow.setFullScreen(true);
  }

  customerWindow.on('closed', () => { customerWindow = null; });
}

app.whenReady().then(() => {
  Menu.setApplicationMenu(null);
  createPosWindow();
  createCustomerWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0){
    createPosWindow();
    createCustomerWindow();
  }
});

/* ---- Relay live cart / invoice events from the POS window to the customer display ---- */
ipcMain.on('cart-update', (_event, data) => {
  if(customerWindow) customerWindow.webContents.send('cart-update', data);
});
ipcMain.on('invoice-complete', (_event, data) => {
  if(customerWindow) customerWindow.webContents.send('invoice-complete', data);
});
ipcMain.on('toggle-fullscreen', () => {
  if(customerWindow) customerWindow.setFullScreen(!customerWindow.isFullScreen());
});

/* ---- Auto-backup: pick a folder, and write the backup file into it ---- */
ipcMain.handle('choose-backup-folder', async () => {
  const result = await dialog.showOpenDialog(posWindow, {
    title: 'انتخاب پوشه پشتیبان',
    properties: ['openDirectory', 'createDirectory']
  });
  if(result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('write-backup-file', async (_event, { folderPath, filename, content }) => {
  try{
    fs.writeFileSync(path.join(folderPath, filename), content, 'utf-8');
    return { ok: true };
  }catch(err){
    return { ok: false, error: err.message };
  }
});
