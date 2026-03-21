import { useState } from 'react'
import Settings from './components/Settings'
import Calculator from './components/Calculator'
import CustomerReport from './components/CustomerReport'
import { DEFAULT_SETTINGS, SETTINGS_VERSION } from './defaults'
import './App.css'

function App() {
  const [activeTab, setActiveTab] = useState('calculator')
  const [settings, setSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('transportCostSettings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed._version !== SETTINGS_VERSION) {
          localStorage.removeItem('transportCostSettings')
          return DEFAULT_SETTINGS
        }
        const fp = parsed.fuelPrice ?? DEFAULT_SETTINGS.fuelPrice
        const merged = {
          _version: SETTINGS_VERSION,
          fuelPrice: fp,
          overheadPerMonth: parsed.overheadPerMonth ?? DEFAULT_SETTINGS.overheadPerMonth,
          totalFleetTripsPerMonth: parsed.totalFleetTripsPerMonth ?? DEFAULT_SETTINGS.totalFleetTripsPerMonth,
          vehicles: {},
        }
        for (const key of Object.keys(DEFAULT_SETTINGS.vehicles)) {
          merged.vehicles[key] = {
            ...DEFAULT_SETTINGS.vehicles[key],
            ...(parsed.vehicles?.[key] || {}),
            fuelPrice: fp,
          }
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

  const handleFuelPriceChange = (e) => {
    const fp = parseFloat(e.target.value) || 0
    const newSettings = {
      ...settings,
      fuelPrice: fp,
      vehicles: Object.fromEntries(
        Object.keys(settings.vehicles).map(k => [k, { ...settings.vehicles[k], fuelPrice: fp }])
      ),
    }
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

          <div className="header-fuel">
            <span className="fuel-label">⛽ ดีเซล</span>
            <input
              type="number"
              className="fuel-input"
              value={settings.fuelPrice ?? 36}
              onChange={handleFuelPriceChange}
              step={0.01}
              min={0}
            />
            <span className="fuel-unit">บาท/ล.</span>
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
            <button
              className={`nav-btn ${activeTab === 'report' ? 'active' : ''}`}
              onClick={() => setActiveTab('report')}
            >
              <span className="nav-icon">📋</span>
              รายงานลูกค้า
            </button>
          </nav>
        </div>
      </header>

      <main className="app-main">
        {activeTab === 'calculator' && <Calculator settings={settings} />}
        {activeTab === 'settings' && <Settings settings={settings} onSave={handleSaveSettings} />}
        {activeTab === 'report' && <CustomerReport settings={settings} />}
      </main>
    </div>
  )
}

export default App
