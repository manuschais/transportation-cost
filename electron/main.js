import { app, BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { fileURLToPath } from 'url'

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

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
