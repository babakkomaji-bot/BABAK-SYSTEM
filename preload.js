const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('posBridge', {
  // Called by the cashier (POS) window whenever the cart changes
  sendCartUpdate: (data) => ipcRenderer.send('cart-update', data),
  // Called by the cashier (POS) window when a sale is finalized
  sendInvoice: (data) => ipcRenderer.send('invoice-complete', data),

  // Used by the customer-display window to receive live cart updates
  onCartUpdate: (callback) => ipcRenderer.on('cart-update', (_event, data) => callback(data)),
  // Used by the customer-display window to receive the finished receipt
  onInvoice: (callback) => ipcRenderer.on('invoice-complete', (_event, data) => callback(data)),

  // Used by the customer-display window's fullscreen toggle button
  toggleFullscreen: () => ipcRenderer.send('toggle-fullscreen'),

  // Auto-backup: let the user pick a folder, and write the backup file into it
  chooseBackupFolder: () => ipcRenderer.invoke('choose-backup-folder'),
  writeBackupFile: (data) => ipcRenderer.invoke('write-backup-file', data)
});
