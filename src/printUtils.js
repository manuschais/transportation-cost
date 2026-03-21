const VEHICLE_LABELS = { '4wheels':'รถ 4 ล้อ', '6wheels':'รถ 6 ล้อ', '10wheels':'รถ 10 ล้อ', trailer:'รถ 12 ล้อ' }
const VEHICLE_TYPES  = ['4wheels','6wheels','10wheels','trailer']

function fmtN(n, d=0) {
  if (n == null || !isFinite(Number(n)) || isNaN(Number(n))) return '-'
  return Number(n).toLocaleString('th-TH', { minimumFractionDigits: d, maximumFractionDigits: d })
}

function printWindow(html, css) {
  const w = window.open('', '_blank')
  w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8">
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body { font-family: 'Sarabun', 'Tahoma', sans-serif; font-size: 11pt; color: #111; background: #fff; }
      ${css}
    </style>
  </head><body>${html}</body></html>`)
  w.document.close()
  w.focus()
  setTimeout(() => { w.print(); w.close() }, 400)
}

// ─── A4 Landscape: ตารางรายงาน ────────────────────────────────────────────
export function printReportTable(customers) {
  if (!customers.length) { alert('ไม่มีข้อมูล'); return }

  const today = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' })

  const rows = customers.map(c => {
    const dist = (parseFloat(c.distanceGo)||0) + (parseFloat(c.distanceReturn)||0)
    const fuel = c.fuelPrice ?? c.results?.['4wheels']?.fuelPrice ?? '-'
    const cells = VEHICLE_TYPES.map(t => `
      <td class="num">${fmtN(c.results?.[t]?.totalCost)}</td>
      <td class="num s">${fmtN(c.results?.[t]?.costPerTon)}</td>
    `).join('')
    return `<tr>
      <td>${c.calculationDate || ''}</td>
      <td>${c.customerCode || '-'}</td>
      <td class="name">${c.customerName || ''}</td>
      <td>${c.province || '-'}</td>
      <td class="num">${dist}</td>
      <td class="num">${fuel}</td>
      ${cells}
    </tr>`
  }).join('')

  const html = `
    <div class="header">
      <div class="title">รายงานต้นทุนค่าขนส่ง</div>
      <div class="sub">วันที่พิมพ์: ${today} | จำนวน ${customers.length} รายการ</div>
    </div>
    <table>
      <thead>
        <tr>
          <th rowspan="2">วันที่</th>
          <th rowspan="2">รหัส</th>
          <th rowspan="2">ชื่อลูกค้า</th>
          <th rowspan="2">จังหวัด</th>
          <th rowspan="2">ระยะ<br/>(กม.)</th>
          <th rowspan="2">น้ำมัน<br/>(฿/ล.)</th>
          <th colspan="2">รถ 4 ล้อ</th>
          <th colspan="2">รถ 6 ล้อ</th>
          <th colspan="2">รถ 10 ล้อ</th>
          <th colspan="2">รถ 12 ล้อ</th>
        </tr>
        <tr>
          <th>/เที่ยว</th><th>/ตัน</th>
          <th>/เที่ยว</th><th>/ตัน</th>
          <th>/เที่ยว</th><th>/ตัน</th>
          <th>/เที่ยว</th><th>/ตัน</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `

  const css = `
    @page { size: A4 landscape; margin: 12mm 10mm; }
    .header { margin-bottom: 8px; }
    .title { font-size: 14pt; font-weight: bold; }
    .sub { font-size: 9pt; color: #555; margin-top: 2px; }
    table { width: 100%; border-collapse: collapse; font-size: 8.5pt; }
    th, td { border: 1px solid #bbb; padding: 3px 5px; vertical-align: middle; }
    thead tr:first-child th { background: #1e3a8a; color: #fff; text-align: center; }
    thead tr:last-child th { background: #dbeafe; text-align: center; }
    td.num { text-align: right; }
    td.name { min-width: 90px; }
    td.s { color: #555; }
    tbody tr:nth-child(even) { background: #f8faff; }
  `

  printWindow(html, css)
}

// ─── A5 Portrait: รายละเอียดลูกค้า 1 ราย ─────────────────────────────────
export function printCustomerDetail(c) {
  const dist = (parseFloat(c.distanceGo)||0) + (parseFloat(c.distanceReturn)||0)
  const fuel = c.fuelPrice ?? c.results?.['4wheels']?.fuelPrice ?? '-'
  const today = new Date().toLocaleDateString('th-TH', { year:'numeric', month:'long', day:'numeric' })

  const vehicleRows = VEHICLE_TYPES.map(t => `
    <tr>
      <td>${VEHICLE_LABELS[t]}</td>
      <td class="num">${fmtN(c.results?.[t]?.totalCost, 2)}</td>
      <td class="num">${fmtN(c.results?.[t]?.costPerTon, 2)}</td>
      <td class="num">${c.results?.[t]?.effectiveWeight ?? '-'}</td>
    </tr>
  `).join('')

  const html = `
    <div class="header">
      <div class="title">ใบคำนวนต้นทุนค่าขนส่ง</div>
      <div class="sub">วันที่พิมพ์: ${today}</div>
    </div>

    <div class="info-grid">
      <div class="info-row"><span>รหัสลูกค้า</span><strong>${c.customerCode || '-'}</strong></div>
      <div class="info-row"><span>วันที่บันทึก</span><strong>${c.calculationDate || '-'}</strong></div>
      <div class="info-row full"><span>ชื่อลูกค้า</span><strong>${c.customerName || '-'}</strong></div>
      <div class="info-row full"><span>ที่อยู่</span><strong>${c.address || '-'}</strong></div>
      <div class="info-row"><span>จังหวัด</span><strong>${c.province || '-'}</strong></div>
    </div>

    <div class="section-title">ข้อมูลเที่ยววิ่ง</div>
    <div class="trip-grid">
      <div class="trip-item"><span>ระยะทางไป</span><strong>${fmtN(c.distanceGo)} กม.</strong></div>
      <div class="trip-item"><span>ระยะทางกลับ</span><strong>${fmtN(c.distanceReturn || c.distanceGo)} กม.</strong></div>
      <div class="trip-item"><span>ระยะรวม</span><strong>${fmtN(dist)} กม.</strong></div>
      <div class="trip-item"><span>ค่าทางด่วน</span><strong>${fmtN(c.toll, 0)} บาท</strong></div>
      <div class="trip-item"><span>น้ำหนักบรรทุก</span><strong>${c.actualWeight || '-'} ตัน</strong></div>
      <div class="trip-item"><span>ราคาน้ำมัน</span><strong>${fuel} บาท/ล.</strong></div>
    </div>

    <div class="section-title">ต้นทุนค่าขนส่ง</div>
    <table>
      <thead>
        <tr>
          <th>ประเภทรถ</th>
          <th>บาท/เที่ยว</th>
          <th>บาท/ตัน</th>
          <th>น้ำหนัก (ตัน)</th>
        </tr>
      </thead>
      <tbody>${vehicleRows}</tbody>
    </table>

    ${c.remarks ? `<div class="remarks"><span>หมายเหตุ:</span> ${c.remarks}</div>` : ''}
  `

  const css = `
    @page { size: A5 portrait; margin: 10mm; }
    .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 6px; margin-bottom: 10px; }
    .title { font-size: 14pt; font-weight: bold; color: #1e3a8a; }
    .sub { font-size: 9pt; color: #666; margin-top: 2px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 12px; margin-bottom: 10px; }
    .info-row { display: flex; gap: 6px; font-size: 10pt; }
    .info-row.full { grid-column: 1/-1; }
    .info-row span { color: #555; min-width: 70px; flex-shrink: 0; }
    .info-row strong { color: #111; }
    .section-title { font-size: 10pt; font-weight: bold; background: #dbeafe; color: #1e3a8a;
      padding: 3px 8px; border-radius: 3px; margin: 8px 0 5px; }
    .trip-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 4px 12px; margin-bottom: 8px; }
    .trip-item { display: flex; flex-direction: column; font-size: 10pt; }
    .trip-item span { font-size: 8.5pt; color: #666; }
    .trip-item strong { color: #111; }
    table { width: 100%; border-collapse: collapse; font-size: 10pt; }
    th, td { border: 1px solid #bbb; padding: 4px 8px; }
    th { background: #1e3a8a; color: #fff; text-align: center; }
    td.num { text-align: right; }
    tbody tr:nth-child(even) { background: #f0f6ff; }
    .remarks { margin-top: 8px; font-size: 9.5pt; color: #444; border-top: 1px dashed #bbb; padding-top: 6px; }
    .remarks span { font-weight: bold; }
  `

  printWindow(html, css)
}
