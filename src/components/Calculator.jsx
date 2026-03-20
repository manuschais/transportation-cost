import { useMemo, useState } from 'react'
import { VEHICLE_TYPES, VEHICLE_ICONS } from '../defaults'
import { calculateTrip } from '../calculate'

const CARD_COLORS = {
  '4wheels':  '#3b82f6',
  '6wheels':  '#10b981',
  '10wheels': '#f59e0b',
  'trailer':  '#8b5cf6',
}

const BREAKDOWN_ITEMS = [
  { key: 'fuelCost',            label: 'น้ำมัน',    color: '#f59e0b' },
  { key: 'laborCost',           label: 'ค่าแรง',    color: '#10b981' },
  { key: 'tollCost',            label: 'ทางด่วน',   color: '#3b82f6' },
  { key: 'depreciationPerTrip', label: 'ค่าเสื่อม', color: '#8b5cf6' },
  { key: 'maintenanceCost',     label: 'บำรุง',     color: '#06b6d4' },
  { key: 'repairCost',          label: 'ซ่อม',      color: '#ef4444' },
  { key: 'insurancePerTrip',    label: 'ป.รถ',      color: '#64748b' },
  { key: 'taxPerTrip',          label: 'ภาษี',      color: '#94a3b8' },
  { key: 'cargoInsuranceCost',  label: 'ป.สค.',     color: '#d97706' },
]

function fmt(num, d = 0) {
  if (!isFinite(num) || isNaN(num)) return '0'
  return num.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d })
}

export default function Calculator({ settings }) {
  const [distanceGo, setDistanceGo]     = useState('')
  const [sameReturn, setSameReturn]     = useState(true)
  const [distanceReturn, setDistReturn] = useState('')
  const [tollGo, setTollGo]             = useState(0)
  const [tollReturn, setTollReturn]     = useState(0)
  const [actualWeight, setWeight]       = useState('')
  const [useMinWeight, setUseMinWeight] = useState(true)

  const results = useMemo(() => {
    const distGo = parseFloat(distanceGo) || 0
    if (distGo <= 0) return null
    const distRet = sameReturn ? distanceGo : (distanceReturn || distanceGo)
    return VEHICLE_TYPES.reduce((acc, type) => {
      const v = settings.vehicles[type]
      acc[type] = calculateTrip(v, {
        distanceGo,
        distanceReturn: distRet,
        tollGo,
        tollReturn,
        actualWeight,
        useMinWeight,
        cargoValue: v.defaultCargoValue ?? 0,
      })
      return acc
    }, {})
  }, [distanceGo, sameReturn, distanceReturn, tollGo, tollReturn, actualWeight, useMinWeight, settings])

  const totalToll = (parseFloat(tollGo) || 0) + (parseFloat(tollReturn) || 0)
  const sampleDist = results ? Object.values(results)[0].totalDistance : 0

  return (
    <div className="calculator-page">
      <div className="calc-layout">

        {/* ===== LEFT: Input Panel ===== */}
        <div className="calc-panel">
          <div className="calc-panel-header">🎯 ข้อมูลการขนส่ง</div>
          <div className="calc-panel-body">

            <div className="input-section">
              <div className="input-section-title">ระยะทาง</div>
              <div className="input-row">
                <div className="input-group">
                  <label>ไป</label>
                  <div className="input-with-unit">
                    <input type="number" value={distanceGo}
                      onChange={e => setDistanceGo(e.target.value)} placeholder="0" min={0} />
                    <span className="unit">กม.</span>
                  </div>
                </div>
                <div className="input-group">
                  <label>กลับ</label>
                  <div className="input-with-unit">
                    <input type="number"
                      value={sameReturn ? distanceGo : distanceReturn}
                      onChange={e => setDistReturn(e.target.value)}
                      placeholder="0" min={0} disabled={sameReturn} />
                    <span className="unit">กม.</span>
                  </div>
                  <div className="checkbox-wrap">
                    <input type="checkbox" id="sameRet" checked={sameReturn}
                      onChange={e => setSameReturn(e.target.checked)} />
                    <label htmlFor="sameRet">เท่ากับไป</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="input-section">
              <div className="input-section-title">ค่าทางด่วน</div>
              <div className="input-row">
                <div className="input-group">
                  <label>ไป</label>
                  <div className="input-with-unit">
                    <input type="number" value={tollGo}
                      onChange={e => setTollGo(e.target.value)} min={0} />
                    <span className="unit">บาท</span>
                  </div>
                </div>
                <div className="input-group">
                  <label>กลับ</label>
                  <div className="input-with-unit">
                    <input type="number" value={tollReturn}
                      onChange={e => setTollReturn(e.target.value)} min={0} />
                    <span className="unit">บาท</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="input-section">
              <div className="input-section-title">น้ำหนักบรรทุก</div>
              <div className="input-group">
                <label>น้ำหนักบรรทุก</label>
                <div className="input-with-unit">
                  <input type="number" value={actualWeight}
                    onChange={e => setWeight(e.target.value)} placeholder="0" min={0} step={0.5} />
                  <span className="unit">ตัน</span>
                </div>
              </div>
              <div className="min-weight-box">
                <label className="mw-label">
                  <input type="checkbox" checked={useMinWeight}
                    onChange={e => setUseMinWeight(e.target.checked)} />
                  ใช้ Minimum Weight ในการคำนวน
                </label>
              </div>
            </div>

            {results && (
              <div className="route-summary">
                <span>รวม <strong>{sampleDist} กม.</strong></span>
                <span>ด่วน <strong>{fmt(totalToll)} บาท</strong></span>
              </div>
            )}

          </div>
        </div>

        {/* ===== RIGHT: All vehicle results ===== */}
        <div className="calc-results-area">
          {results ? (
            <div className="vehicle-results-grid">
              {VEHICLE_TYPES.map(type => {
                const r   = results[type]
                const v   = settings.vehicles[type]
                const col = CARD_COLORS[type]
                const maxVal = Math.max(...BREAKDOWN_ITEMS.map(i => r.breakdown[i.key] || 0))
                const usingMin = useMinWeight && parseFloat(actualWeight) > 0 && parseFloat(actualWeight) < v.minWeight
                const fuelLiters = ((r.totalDistance / 100) * v.fuelConsumption).toFixed(1)

                return (
                  <div key={type} className="vehicle-result-card" style={{ borderTopColor: col }}>

                    {/* Header */}
                    <div className="vrc-header">
                      <span className="vrc-icon">{VEHICLE_ICONS[type]}</span>
                      <div style={{ flex: 1 }}>
                        <div className="vrc-name">{v.name}</div>
                        <div className="vrc-cap">ความจุ {v.capacity} ตัน · Min {v.minWeight} ตัน</div>
                      </div>
                      {usingMin && <span className="vrc-minbadge">ใช้ Min</span>}
                    </div>

                    {/* Summary numbers */}
                    <div className="vrc-numbers">
                      <div className="vrc-number-item">
                        <div className="vrc-num-label">ต้นทุน / เที่ยว</div>
                        <div className="vrc-num-val" style={{ color: col }}>{fmt(r.totalCost, 2)}</div>
                        <div className="vrc-num-unit">บาท</div>
                      </div>
                      <div className="vrc-divider" />
                      <div className="vrc-number-item">
                        <div className="vrc-num-label">ต้นทุน / ตัน</div>
                        <div className="vrc-num-val" style={{ color: col }}>{fmt(r.costPerTon, 2)}</div>
                        <div className="vrc-num-unit">บาท/ตัน · {r.effectiveWeight} ตัน</div>
                      </div>
                    </div>

                    {/* Breakdown bars */}
                    <div className="vrc-breakdown">
                      {BREAKDOWN_ITEMS.map(({ key, label, color }) => {
                        const val  = r.breakdown[key] || 0
                        const pct  = r.totalCost > 0 ? (val / r.totalCost) * 100 : 0
                        const barW = maxVal > 0 ? (val / maxVal) * 100 : 0
                        return (
                          <div key={key} className="vrc-brow">
                            <span className="vrc-blabel">{label}</span>
                            <div className="vrc-bbar-wrap">
                              <div className="vrc-bbar" style={{ width: `${barW}%`, background: color }} />
                            </div>
                            <span className="vrc-bamt">{fmt(val, 0)}</span>
                            <span className="vrc-bpct">{fmt(pct, 0)}%</span>
                          </div>
                        )
                      })}
                    </div>

                    {/* Footer */}
                    <div className="vrc-footer">
                      น้ำมัน {fuelLiters} ล. · ระยะ {r.totalDistance} กม. · สินค้า {(v.defaultCargoValue ?? 0).toLocaleString('th-TH')} บาท
                    </div>

                  </div>
                )
              })}
            </div>
          ) : (
            <div className="empty-result">
              <div className="empty-icon">🚛</div>
              <p>กรอกระยะทางเพื่อดูต้นทุน</p>
              <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
                ผลการคำนวนทั้ง 4 ประเภทรถจะแสดงอัตโนมัติ
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
