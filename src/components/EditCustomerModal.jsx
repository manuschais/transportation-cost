import { useState } from 'react'
import { updateCustomer } from '../customerStorage'
import { VEHICLE_TYPES, VEHICLE_LABELS } from '../defaults'
import { calculateTrip } from '../calculate'

const PROVINCES = ['กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี']

function fmt(n, d = 2) {
  return isFinite(n) && !isNaN(n) ? n.toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d }) : '-'
}

export default function EditCustomerModal({ customer, settings, onClose, onSaved }) {
  const [form, setForm] = useState({
    customerCode: customer.customerCode || '',
    customerName: customer.customerName || '',
    address:      customer.address || '',
    province:     customer.province || '',
    remarks:      customer.remarks || '',
  })
  const [distanceGo,     setDistanceGo]     = useState(customer.distanceGo || '')
  const [distanceReturn, setDistanceReturn] = useState(customer.distanceReturn || '')
  const [toll,           setToll]           = useState(customer.toll || 0)
  const [actualWeight,   setActualWeight]   = useState(customer.actualWeight || '')
  const [useMinWeight,   setUseMinWeight]   = useState(customer.useMinWeight ?? true)
  const [results,        setResults]        = useState(customer.results)
  const [recalculated,   setRecalculated]   = useState(false)
  const [done,           setDone]           = useState(false)

  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleRecalculate = () => {
    if (!distanceGo) return
    const overheadPerTrip = (parseFloat(settings.overheadPerMonth) || 0) /
      (parseFloat(settings.totalFleetTripsPerMonth) || 1)
    const newResults = Object.fromEntries(
      VEHICLE_TYPES.map(type => {
        const v = settings.vehicles[type]
        const r = calculateTrip(v, {
          distanceGo,
          distanceReturn: distanceReturn || distanceGo,
          tollGo: parseFloat(toll) || 0,
          tollReturn: 0,
          actualWeight,
          useMinWeight,
          cargoValue: v.defaultCargoValue ?? 0,
          overheadPerTrip,
        })
        return [type, { totalCost: r.totalCost, costPerTon: r.costPerTon, effectiveWeight: r.effectiveWeight }]
      })
    )
    setResults(newResults)
    setRecalculated(true)
  }

  const handleSave = () => {
    if (!form.customerName.trim()) { alert('กรุณากรอกชื่อลูกค้า'); return }
    updateCustomer(customer.id, {
      ...form,
      distanceGo,
      distanceReturn: distanceReturn || distanceGo,
      toll: parseFloat(toll) || 0,
      actualWeight,
      useMinWeight,
      fuelPrice: settings.fuelPrice ?? customer.fuelPrice,
      results,
    })
    setDone(true)
    setTimeout(() => { onSaved(); onClose() }, 800)
  }

  const totalDist = (parseFloat(distanceGo) || 0) + (parseFloat(distanceReturn || distanceGo) || 0)

  return (
    <div className="modal-overlay">
      <div className="modal-box modal-box-lg">
        <div className="modal-header">
          <span>✏️ แก้ไขข้อมูลลูกค้า</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">

          {/* Customer Info */}
          <div className="edit-section-title">ข้อมูลลูกค้า</div>
          <div className="modal-row2">
            <div className="mfield">
              <label>รหัสลูกค้า</label>
              <input name="customerCode" value={form.customerCode} onChange={ch} placeholder="C001" />
            </div>
            <div className="mfield">
              <label>วันที่บันทึก</label>
              <input value={customer.calculationDate} disabled />
            </div>
          </div>
          <div className="mfield">
            <label>ชื่อลูกค้า *</label>
            <input name="customerName" value={form.customerName} onChange={ch} />
          </div>
          <div className="modal-row2">
            <div className="mfield">
              <label>ที่อยู่</label>
              <input name="address" value={form.address} onChange={ch} />
            </div>
            <div className="mfield">
              <label>จังหวัด</label>
              <select name="province" value={form.province} onChange={ch}>
                <option value="">-- เลือกจังหวัด --</option>
                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="mfield">
            <label>หมายเหตุ</label>
            <textarea name="remarks" value={form.remarks} onChange={ch} rows={2} />
          </div>

          {/* Trip Data */}
          <div className="edit-section-title" style={{ marginTop: 12 }}>
            ข้อมูลเที่ยววิ่ง
            {recalculated && <span className="recalc-badge">✓ คำนวนใหม่แล้ว</span>}
          </div>
          <div className="modal-row2">
            <div className="mfield">
              <label>ระยะทางไป (กม.)</label>
              <input type="number" value={distanceGo} onChange={e => { setDistanceGo(e.target.value); setRecalculated(false) }} min={0} />
            </div>
            <div className="mfield">
              <label>ระยะทางกลับ (กม.)</label>
              <input type="number" value={distanceReturn} onChange={e => { setDistanceReturn(e.target.value); setRecalculated(false) }} min={0} placeholder={`= ${distanceGo || 0} (เท่ากับไป)`} />
            </div>
          </div>
          <div className="modal-row2">
            <div className="mfield">
              <label>ค่าทางด่วน รวม (บาท)</label>
              <input type="number" value={toll} onChange={e => { setToll(e.target.value); setRecalculated(false) }} min={0} />
            </div>
            <div className="mfield">
              <label>น้ำหนักบรรทุก (ตัน)</label>
              <input type="number" value={actualWeight} onChange={e => { setActualWeight(e.target.value); setRecalculated(false) }} min={0} step={0.5} />
            </div>
          </div>
          <div className="mfield">
            <label style={{ flexDirection: 'row', alignItems: 'center', gap: 8, display: 'flex' }}>
              <input type="checkbox" checked={useMinWeight} onChange={e => { setUseMinWeight(e.target.checked); setRecalculated(false) }} />
              ใช้ Minimum Weight ในการคำนวน
            </label>
          </div>

          <button className="btn-recalc" onClick={handleRecalculate}>
            🔄 คำนวนราคาใหม่ (ระยะ {totalDist} กม.)
          </button>

          {/* Results Preview */}
          <div className="edit-results">
            {VEHICLE_TYPES.map(t => (
              <div key={t} className="edit-result-row">
                <span className="edit-result-label">{VEHICLE_LABELS[t]}</span>
                <span className="edit-result-trip">{fmt(results?.[t]?.totalCost)} บาท/เที่ยว</span>
                <span className="edit-result-ton">{fmt(results?.[t]?.costPerTon)} บาท/ตัน</span>
                <span className="edit-result-wt">({results?.[t]?.effectiveWeight ?? '-'} ตัน)</span>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-mcancel" onClick={onClose}>ยกเลิก</button>
          <button className={`btn-msave ${done ? 'done' : ''}`} onClick={handleSave}>
            {done ? '✓ บันทึกแล้ว' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
