import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  exportPDF: (html, options) => ipcRenderer.invoke('export-pdf', html, options),
})
