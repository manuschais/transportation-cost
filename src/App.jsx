import { useState } from 'react'
import Settings from './components/Settings'
import Calculator from './components/Calculator'
import { DEFAULT_SETTINGS, SETTINGS_VERSION } from './defaults'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('transportCostSettings')
      if (saved) {
        const parsed = JSON.parse(saved)
        // If version mismatch, discard old settings and use new defaults
        if (parsed._version !== SETTINGS_VERSION) {
          localStorage.removeItem('transportCostSettings')
          return DEFAULT_SETTINGS
        }
        // Merge with defaults to ensure all new fields exist
        const merged = { _version: SETTINGS_VERSION, vehicles: {} }
        for (const key of Object.keys(DEFAULT_SETTINGS.vehicles)) {
          merged.vehicles[key] = { ...DEFAULT_SETTINGS.vehicles[key], ...(parsed.vehicles?.[key] || {}) }
        }
        return merged
      }
    } catch {}
    return DEFAULT_SETTINGS
  })

  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('transportCostSettings', JSON.stringify(newSettings))
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="header-brand">
            <span className="brand-icon">🚚</span>
            <div className="brand-text">
              <h1>ระบบคำนวนต้นทุนค่าขนส่ง</h1>
              <span>Transportation Cost Calculator</span>
            </div>
          </div>
          <nav className="header-nav">
            <button
              className={`nav-btn ${activeTab === 'calculator' ? 'active' : ''}`}
              onClick={() => setActiveTab('calculator')}
            >
              <span className="nav-icon">🧮</span>
              คำนวนค่าขนส่ง
            </button>
            <button
              className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="nav-icon">⚙️</span>
              ตั้งค่าต้นทุน
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'calculator'
          ? <Calculator settings={settings} />
          : <Settings settings={settings} onSave={handleSaveSettings} />
        }
      </main>
    </div>
  )
}

export default App
