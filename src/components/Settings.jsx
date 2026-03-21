import { useState } from 'react'
import { DEFAULT_SETTINGS, VEHICLE_TYPES, VEHICLE_LABELS, VEHICLE_ICONS } from '../defaults'

function FormField({ label, name, value, onChange, unit, hint, min = 0, step = 1, type = 'number', fullRow = false }) {
  return (
    <div className={`form-field${fullRow ? ' full' : ''}`}>
      <label className="field-label">{label}</label>
      <div className="field-input-wrap">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          min={type === 'number' ? min : undefined}
          step={type === 'number' ? step : undefined}
          className="field-input"
        />
        {unit && <span className="field-unit">{unit}</span>}
      </div>
      {hint && <span className="field-hint">{hint}</span>}
    </div>
  )
}

const SECTION_COLORS = {
  basic: '#3b82f6',
  fuel: '#f59e0b',
  labor: '#10b981',
  capital: '#8b5cf6',
  maintenance: '#06b6d4',
  repair: '#ef4444',
  insurance: '#64748b',
  cargo: '#d97706',
}

function Section({ title, color, children }) {
  return (
    <div className="settings-section" style={{ borderLeftColor: color }}>
      <div className="section-header">
        <h3 className="section-title" style={{ color }}>{title}</h3>
      </div>
      <div className="section-body">
        {children}
      </div>
    </div>
  )
}

export default function Settings({ settings, onSave }) {
  const [activeVehicle, setActiveVehicle] = useState('4wheels')
  const [localSettings, setLocalSettings] = useState(() => JSON.parse(JSON.stringify(settings)))
  const [saved, setSaved] = useState(false)

  const vehicle = localSettings.vehicles[activeVehicle]

  const handleGlobalChange = (e) => {
    const val = e.target.value === '' ? '' : parseFloat(e.target.value)
    setLocalSettings(prev => ({ ...prev, [e.target.name]: val }))
    setSaved(false)
  }

  const handleChange = (e) => {
    const { name, value, type } = e.target
    const parsed = type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    setLocalSettings(prev => ({
      ...prev,
      vehicles: {
        ...prev.vehicles,
        [activeVehicle]: {
          ...prev.vehicles[activeVehicle],
          [name]: parsed,
        },
      },
    }))
    setSaved(false)
  }

  const handleReset = () => {
    if (window.confirm(`รีเซ็ตค่าตั้งต้น "${VEHICLE_LABELS[activeVehicle]}" เป็นค่าเริ่มต้น?`)) {
      setLocalSettings(prev => ({
        ...prev,
        vehicles: {
          ...prev.vehicles,
          [activeVehicle]: { ...DEFAULT_SETTINGS.vehicles[activeVehicle] },
        },
      }))
      setSaved(false)
    }
  }

  const handleSave = () => {
    onSave(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleExport = () => {
    const json = JSON.stringify(localSettings, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `transport-config-${new Date().toISOString().slice(0,10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result)
        if (!parsed.vehicles) throw new Error('ไฟล์ไม่ถูกต้อง')
        const merged = { ...parsed, _version: localSettings._version }
        setLocalSettings(merged)
        setSaved(false)
        alert('✅ นำเข้าการตั้งค่าสำเร็จ — กด "บันทึกการตั้งค่า" เพื่อใช้งาน')
      } catch {
        alert('❌ ไฟล์ไม่ถูกต้อง กรุณาใช้ไฟล์ที่ export จากระบบนี้')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  // Preview calculated values
  const tripsPerMonth = parseFloat(vehicle.tripsPerMonth) || 1
  const depPerTrip = (parseFloat(vehicle.vehicleCost) || 0) / ((parseFloat(vehicle.usefulLifeYears) || 1) * 12 * tripsPerMonth)
  const insPerTrip = (parseFloat(vehicle.vehicleInsurancePerYear) || 0) / (12 * tripsPerMonth)
  const taxPerTrip = (parseFloat(vehicle.taxRenewalPerYear) || 0) / (12 * tripsPerMonth)
  const fmt = (n) => n.toLocaleString('th-TH', { maximumFractionDigits: 2 })

  return (
    <div className="settings-page">
      <div className="page-header">
        <h2>ตั้งค่าต้นทุนรถขนส่ง</h2>
        <p>กำหนดต้นทุนสำหรับรถแต่ละประเภท — ค่าที่บันทึกจะใช้เป็นค่าเริ่มต้นในการคำนวน</p>
      </div>

      {/* Global: Overhead */}
      {(() => {
        const totalTrips = Object.values(localSettings.vehicles)
          .reduce((s, v) => s + (parseFloat(v.tripsPerMonth) || 0), 0)
        const perTrip = (parseFloat(localSettings.overheadPerMonth) || 0) / (totalTrips || 1)
        return (
          <div className="settings-section global-section" style={{ borderLeftColor: '#0891b2' }}>
            <div className="section-header">
              <h3 className="section-title" style={{ color: '#0891b2' }}>ค่า Overhead (ส่วนกลาง)</h3>
              <span className="section-hint">เงินเดือนแอดมิน · ค่าเช่าออฟฟิศ · ค่าโทรศัพท์ · ค่าน้ำไฟ · ฯลฯ</span>
            </div>
            <div className="section-body">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Overhead รวม/เดือน</label>
                  <div className="field-input-wrap">
                    <input
                      type="number" name="overheadPerMonth"
                      value={localSettings.overheadPerMonth ?? 30000}
                      onChange={handleGlobalChange}
                      min={0} className="field-input"
                    />
                    <span className="field-unit">บาท/เดือน</span>
                  </div>
                </div>
                <div className="form-field">
                  <label className="field-label">จำนวนเที่ยวรวมทั้งหมด</label>
                  <div className="field-input-wrap">
                    <input type="number" value={totalTrips} disabled className="field-input" />
                    <span className="field-unit">เที่ยว/เดือน</span>
                  </div>
                </div>
              </div>
              <div className="field-preview">
                <span>Overhead ต่อเที่ยว ≈</span>
                <strong>{fmt(perTrip)} บาท/เที่ยว (แบ่งเท่ากันทุกประเภทรถ)</strong>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Vehicle Type Tabs */}
      <div className="vehicle-tabs-bar">
        {VEHICLE_TYPES.map(type => (
          <button
            key={type}
            className={`vehicle-tab-btn ${activeVehicle === type ? 'active' : ''}`}
            onClick={() => setActiveVehicle(type)}
          >
            <span className="vehicle-tab-icon">{VEHICLE_ICONS[type]}</span>
            {VEHICLE_LABELS[type]}
          </button>
        ))}
      </div>

      {/* Settings Grid */}
      <div className="settings-grid">

        {/* 1. Basic Info */}
        <Section title="ข้อมูลพื้นฐาน" color={SECTION_COLORS.basic}>
          <div className="form-row">
            <FormField
              label="ชื่อประเภทรถ"
              name="name"
              value={vehicle.name}
              onChange={handleChange}
              type="text"
            />
            <FormField
              label="ความจุสูงสุด"
              name="capacity"
              value={vehicle.capacity}
              onChange={handleChange}
              unit="ตัน"
              step={0.5}
            />
          </div>
          <div className="form-row">
            <FormField
              label="น้ำหนักขั้นต่ำ (Min. Weight)"
              name="minWeight"
              value={vehicle.minWeight}
              onChange={handleChange}
              unit="ตัน"
              step={0.5}
              hint="ใช้คำนวนต้นทุน/ตัน เมื่อน้ำหนักจริงต่ำกว่าค่านี้"
            />
            <FormField
              label="จำนวนเที่ยวต่อเดือน"
              name="tripsPerMonth"
              value={vehicle.tripsPerMonth}
              onChange={handleChange}
              unit="เที่ยว"
              hint="สำหรับคำนวนต้นทุนคงที่เฉลี่ยต่อเที่ยว"
            />
          </div>
        </Section>

        {/* 2. Fuel */}
        <Section title="ค่าน้ำมันเชื้อเพลิง (ดีเซล)" color={SECTION_COLORS.fuel}>
          <FormField
            label="อัตราสิ้นเปลือง"
            name="fuelConsumption"
            value={vehicle.fuelConsumption}
            onChange={handleChange}
            unit="ล./100กม."
            step={0.5}
          />
          <div className="field-preview fuel-note">
            <span>⛽ ราคาน้ำมัน ตั้งค่าที่ Header บาร์ — ใช้ร่วมกันทุกประเภทรถ</span>
            <strong>{localSettings.fuelPrice ?? 36} บาท/ล. → {fmt((vehicle.fuelConsumption || 0) * (localSettings.fuelPrice ?? 36))} บาท/100กม.</strong>
          </div>
        </Section>

        {/* 3. Labor */}
        <Section title="ค่าแรงพนักงาน" color={SECTION_COLORS.labor}>
          <FormField
            label="ค่าแรงต่อเที่ยว (คนขับ + ผู้ช่วย)"
            name="laborPerTrip"
            value={vehicle.laborPerTrip}
            onChange={handleChange}
            unit="บาท/เที่ยว"
          />
        </Section>

        {/* 4. Capital & Depreciation */}
        <Section title="ต้นทุนรถและค่าเสื่อมราคา" color={SECTION_COLORS.capital}>
          <div className="form-row">
            <FormField
              label="ราคารถ (รวมอุปกรณ์)"
              name="vehicleCost"
              value={vehicle.vehicleCost}
              onChange={handleChange}
              unit="บาท"
            />
            <FormField
              label="อายุการใช้งาน"
              name="usefulLifeYears"
              value={vehicle.usefulLifeYears}
              onChange={handleChange}
              unit="ปี"
            />
          </div>
          <div className="field-preview">
            <span>ค่าเสื่อมราคาต่อเที่ยว ≈</span>
            <strong>{fmt(depPerTrip)} บาท</strong>
          </div>
        </Section>

        {/* 5. Maintenance */}
        <Section title="ค่าบำรุงรักษา" color={SECTION_COLORS.maintenance}>
          <FormField
            label="ค่าบำรุงรักษาต่อกิโลเมตร"
            name="maintenancePerKm"
            value={vehicle.maintenancePerKm}
            onChange={handleChange}
            unit="บาท/กม."
            step={0.1}
            hint="รวม: ถ่ายน้ำมันเครื่อง, เปลี่ยนยาง, ฟิลเตอร์, หัวเทียน"
          />
        </Section>

        {/* 6. Repair */}
        <Section title="ค่าซ่อมบำรุง" color={SECTION_COLORS.repair}>
          <FormField
            label="ค่าซ่อมบำรุงต่อกิโลเมตร"
            name="repairPerKm"
            value={vehicle.repairPerKm}
            onChange={handleChange}
            unit="บาท/กม."
            step={0.1}
            hint="ค่าซ่อมทั่วไป, อะไหล่สำรอง, ค่าแรงช่าง"
          />
        </Section>

        {/* 7. Insurance & Tax */}
        <Section title="ค่าประกันรถและภาษี" color={SECTION_COLORS.insurance}>
          <div className="form-row">
            <FormField
              label="ค่าประกันภัยรถยนต์"
              name="vehicleInsurancePerYear"
              value={vehicle.vehicleInsurancePerYear}
              onChange={handleChange}
              unit="บาท/ปี"
            />
            <FormField
              label="ค่าต่อภาษีรถประจำปี"
              name="taxRenewalPerYear"
              value={vehicle.taxRenewalPerYear}
              onChange={handleChange}
              unit="บาท/ปี"
            />
          </div>
          <div className="field-preview">
            <span>ประกัน+ภาษี ต่อเที่ยว ≈</span>
            <strong>{fmt(insPerTrip + taxPerTrip)} บาท</strong>
          </div>
        </Section>

        {/* 8. Cargo Insurance */}
        <Section title="ประกันสินค้า (ป.สค.)" color={SECTION_COLORS.cargo}>
          <div className="form-row">
            <FormField
              label="มูลค่าสินค้าเริ่มต้น"
              name="defaultCargoValue"
              value={vehicle.defaultCargoValue ?? 0}
              onChange={handleChange}
              unit="บาท"
              hint="ใช้คำนวนประกันสินค้าในหน้าคำนวน"
            />
            <FormField
              label="อัตราประกันสินค้า"
              name="cargoInsuranceRate"
              value={vehicle.cargoInsuranceRate}
              onChange={handleChange}
              unit="% ของมูลค่า"
              step={0.01}
              hint="ใส่ 0 หากไม่ใช้ประกันสินค้า"
            />
          </div>
          <div className="field-preview">
            <span>ประกันสินค้าต่อเที่ยว ≈</span>
            <strong>{fmt((vehicle.defaultCargoValue ?? 0) * (vehicle.cargoInsuranceRate || 0) / 100)} บาท</strong>
          </div>
        </Section>

      </div>

      {/* Save Actions */}
      <div className="settings-actions">
        <div className="settings-actions-left">
          <button className="btn-export" onClick={handleExport} title="ดาวน์โหลดการตั้งค่าเป็นไฟล์ JSON">
            ⬇ ส่งออกการตั้งค่า
          </button>
          <label className="btn-import" title="นำเข้าการตั้งค่าจากไฟล์ JSON">
            ⬆ นำเข้าการตั้งค่า
            <input type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
        </div>
        <div className="settings-actions-right">
          <button className="btn-reset" onClick={handleReset}>
            รีเซ็ต ({VEHICLE_LABELS[activeVehicle]})
          </button>
          <button className={`btn-save ${saved ? 'saved' : ''}`} onClick={handleSave}>
            {saved ? '✓ บันทึกแล้ว' : 'บันทึกการตั้งค่า'}
          </button>
        </div>
      </div>
    </div>
  )
}
