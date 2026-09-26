// main.js

const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });

  win.loadFile('index.html');
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// فانکشن عمومی سرچ
function filterTable(inputId, tableId, columnIndex) {
  const filter = document.getElementById(inputId).value.toLowerCase();
  const rows = document.querySelectorAll(`#${tableId} tbody tr`);

  rows.forEach(row => {
    const cellText = row.cells[columnIndex].textContent.toLowerCase();
    row.style.display = cellText.includes(filter) ? "" : "none";
  });
}

// سرچ نام کالا در جدول صورت کالاها
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("searchProductName");
  if (searchInput) {
    searchInput.addEventListener("input", function() {
      filterTable("searchProductName", "productTable", 1);
    });
  }
});
