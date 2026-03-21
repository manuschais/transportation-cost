import { useState } from 'react'
import { saveCustomer } from '../customerStorage'
import { VEHICLE_TYPES } from '../defaults'

const PROVINCES = ['กรุงเทพมหานคร','กระบี่','กาญจนบุรี','กาฬสินธุ์','กำแพงเพชร','ขอนแก่น','จันทบุรี','ฉะเชิงเทรา','ชลบุรี','ชัยนาท','ชัยภูมิ','ชุมพร','เชียงราย','เชียงใหม่','ตรัง','ตราด','ตาก','นครนายก','นครปฐม','นครพนม','นครราชสีมา','นครศรีธรรมราช','นครสวรรค์','นนทบุรี','นราธิวาส','น่าน','บึงกาฬ','บุรีรัมย์','ปทุมธานี','ประจวบคีรีขันธ์','ปราจีนบุรี','ปัตตานี','พระนครศรีอยุธยา','พะเยา','พังงา','พัทลุง','พิจิตร','พิษณุโลก','เพชรบุรี','เพชรบูรณ์','แพร่','ภูเก็ต','มหาสารคาม','มุกดาหาร','แม่ฮ่องสอน','ยโสธร','ยะลา','ร้อยเอ็ด','ระนอง','ระยอง','ราชบุรี','ลพบุรี','ลำปาง','ลำพูน','เลย','ศรีสะเกษ','สกลนคร','สงขลา','สตูล','สมุทรปราการ','สมุทรสงคราม','สมุทรสาคร','สระแก้ว','สระบุรี','สิงห์บุรี','สุโขทัย','สุพรรณบุรี','สุราษฎร์ธานี','สุรินทร์','หนองคาย','หนองบัวลำภู','อ่างทอง','อำนาจเจริญ','อุดรธานี','อุตรดิตถ์','อุทัยธานี','อุบลราชธานี']

export default function SaveCustomerModal({ tripData, results, settings, onClose, onSaved }) {
  const [form, setForm] = useState({ customerCode:'', customerName:'', address:'', province:'', remarks:'' })
  const [done, setDone] = useState(false)

  const ch = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSave = () => {
    if (!form.customerName.trim()) { alert('กรุณากรอกชื่อลูกค้า'); return }
    const now = new Date()
    const calculationDate = now.toISOString().slice(0, 10) // CE ISO: 2026-03-21
    const savedResults = Object.fromEntries(
      VEHICLE_TYPES.map(type => [type, {
        totalCost: results[type].totalCost,
        costPerTon: results[type].costPerTon,
        effectiveWeight: results[type].effectiveWeight,
      }])
    )
    saveCustomer({
      ...form,
      calculationDate,
      fuelPrice: settings.fuelPrice ?? 36,
      distanceGo: tripData.distanceGo,
      distanceReturn: tripData.distanceReturn,
      toll: tripData.toll,
      actualWeight: tripData.actualWeight,
      useMinWeight: tripData.useMinWeight,
      results: savedResults,
    })
    setDone(true)
    setTimeout(() => { onSaved(); onClose() }, 800)
  }

  const dist = (parseFloat(tripData.distanceGo)||0) + (parseFloat(tripData.distanceReturn)||0)

  return (
    <div className="modal-overlay">
      <div className="modal-box">
        <div className="modal-header">
          <span>💾 บันทึกข้อมูลลูกค้า</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <div className="modal-row2">
            <div className="mfield">
              <label>รหัสลูกค้า</label>
              <input name="customerCode" value={form.customerCode} onChange={ch} placeholder="C001" />
            </div>
            <div className="mfield">
              <label>วันที่คำนวน</label>
              <input value={new Date().toLocaleDateString('th-TH', { year:'numeric', month:'2-digit', day:'2-digit', calendar:'gregory' })} disabled />
            </div>
          </div>
          <div className="mfield">
            <label>ชื่อลูกค้า *</label>
            <input name="customerName" value={form.customerName} onChange={ch} placeholder="ชื่อบริษัท / ชื่อลูกค้า" />
          </div>
          <div className="mfield">
            <label>ที่อยู่</label>
            <input name="address" value={form.address} onChange={ch} placeholder="บ้านเลขที่ ถนน ตำบล อำเภอ" />
          </div>
          <div className="mfield">
            <label>จังหวัด</label>
            <select name="province" value={form.province} onChange={ch}>
              <option value="">-- เลือกจังหวัด --</option>
              {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="mfield">
            <label>หมายเหตุ</label>
            <textarea name="remarks" value={form.remarks} onChange={ch} placeholder="บันทึกเพิ่มเติม..." rows={2} />
          </div>
          <div className="modal-trip-summary">
            <div className="mts-item"><span>ระยะทางรวม</span><strong>{dist} กม.</strong></div>
            <div className="mts-item"><span>น้ำหนัก</span><strong>{tripData.actualWeight||0} ตัน</strong></div>
            <div className="mts-item"><span>ค่าทางด่วน</span><strong>{tripData.toll||0} บาท</strong></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn-mcancel" onClick={onClose}>ยกเลิก</button>
          <button className={`btn-msave ${done?'done':''}`} onClick={handleSave}>
            {done ? '✓ บันทึกแล้ว' : 'บันทึก'}
          </button>
        </div>
      </div>
    </div>
  )
}
