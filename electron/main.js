import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'
import { writeFileSync, unlinkSync } from 'fs'
import { tmpdir } from 'os'

const __dirname = join(fileURLToPath(import.meta.url), '..')

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 860,
    minWidth: 800,
    minHeight: 600,
    title: 'ระบบคำนวนต้นทุนค่าขนส่ง',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: join(__dirname, '../preload/preload.js'),
    },
    backgroundColor: '#1a2035',
    show: false,
  })

  win.loadFile(join(__dirname, '../../dist-electron/renderer/index.html'))
  win.once('ready-to-show', () => win.show())
  win.setMenuBarVisibility(false)

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url || url === 'about:blank' || url.startsWith('blob:')) return { action: 'allow' }
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ─── PDF Export via IPC ───────────────────────────────────────────────────
ipcMain.handle('export-pdf', async (_event, html, options = {}) => {
  const tmpFile = join(tmpdir(), `tc_print_${Date.now()}.html`)
  try {
    writeFileSync(tmpFile, html, 'utf-8')
    const pdfWin = new BrowserWindow({ show: false, webPreferences: { nodeIntegration: false } })
    await pdfWin.loadFile(tmpFile)
    const pdf = await pdfWin.webContents.printToPDF({
      pageSize:  options.pageSize  || 'A4',
      landscape: options.landscape ?? false,
      printBackground: true,
    })
    pdfWin.close()

    const { filePath } = await dialog.showSaveDialog({
      defaultPath: `report_${new Date().toISOString().slice(0, 10)}.pdf`,
      filters: [{ name: 'PDF Files', extensions: ['pdf'] }],
    })
    if (filePath) {
      writeFileSync(filePath, pdf)
      return { success: true }
    }
    return { success: false }
  } finally {
    try { unlinkSync(tmpFile) } catch {}
  }
})

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
