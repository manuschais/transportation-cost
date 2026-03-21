import * as XLSX from 'xlsx'

const KEY = 'transportCustomers'

export function getCustomers() {
  try { return JSON.parse(localStorage.getItem(KEY)) || [] } catch { return [] }
}

export function saveCustomer(data) {
  const list = getCustomers()
  const record = { ...data, id: Date.now().toString() }
  list.unshift(record)
  localStorage.setItem(KEY, JSON.stringify(list))
  return record
}

export function deleteCustomer(id) {
  localStorage.setItem(KEY, JSON.stringify(getCustomers().filter(c => c.id !== id)))
}

export function clearAllCustomers() {
  localStorage.removeItem(KEY)
}

// แปลงวันที่ ISO (2026-03-21) หรือ BE (21/03/2569) → CE dd/mm/yyyy
function formatCEDate(dateStr) {
  if (!dateStr) return ''
  // ISO format: 2026-03-21
  if (dateStr.includes('-') && dateStr.length >= 10) {
    const [y, m, d] = dateStr.slice(0, 10).split('-')
    return `${d}/${m}/${y}`
  }
  // Thai BE format: 21/03/2569
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const year = parseInt(parts[2])
    const ceYear = year > 2500 ? year - 543 : year
    return `${parts[0]}/${parts[1]}/${ceYear}`
  }
  return dateStr
}

function buildRows(list) {
  return list.map(c => ({
    'วันที่ (ค.ศ.)':        formatCEDate(c.calculationDate),
    'รหัสลูกค้า':           c.customerCode || '',
    'ชื่อลูกค้า':            c.customerName || '',
    'ที่อยู่':               c.address || '',
    'จังหวัด':              c.province || '',
    'ระยะทางไป (กม)':       parseFloat(c.distanceGo) || 0,
    'ระยะทางกลับ (กม)':     parseFloat(c.distanceReturn) || 0,
    'ค่าทางด่วน (บาท)':     parseFloat(c.toll) || 0,
    'น้ำหนัก (ตัน)':        parseFloat(c.actualWeight) || 0,
    'ราคาน้ำมัน (บาท/ล)':  c.fuelPrice ?? c.results?.['4wheels']?.fuelPrice ?? c.results?.['6wheels']?.fuelPrice ?? '',
    '4ล้อ /เที่ยว':         c.results?.['4wheels']?.totalCost?.toFixed(2) || '',
    '4ล้อ /ตัน':            c.results?.['4wheels']?.costPerTon?.toFixed(2) || '',
    '6ล้อ /เที่ยว':         c.results?.['6wheels']?.totalCost?.toFixed(2) || '',
    '6ล้อ /ตัน':            c.results?.['6wheels']?.costPerTon?.toFixed(2) || '',
    '10ล้อ /เที่ยว':        c.results?.['10wheels']?.totalCost?.toFixed(2) || '',
    '10ล้อ /ตัน':           c.results?.['10wheels']?.costPerTon?.toFixed(2) || '',
    '12ล้อ /เที่ยว':        c.results?.['trailer']?.totalCost?.toFixed(2) || '',
    '12ล้อ /ตัน':           c.results?.['trailer']?.costPerTon?.toFixed(2) || '',
    'หมายเหตุ':             c.remarks || '',
  }))
}

export function exportCSV() {
  const list = getCustomers()
  if (!list.length) { alert('ไม่มีข้อมูล'); return }
  const rows = buildRows(list)
  const headers = Object.keys(rows[0])
  const csv = [headers, ...rows.map(r => Object.values(r))]
    .map(r => r.map(v => `"${v}"`).join(','))
    .join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' })
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `customers_${new Date().toISOString().slice(0,10)}.csv`,
  })
  a.click(); URL.revokeObjectURL(a.href)
}

export function exportExcel() {
  const list = getCustomers()
  if (!list.length) { alert('ไม่มีข้อมูล'); return }
  const rows = buildRows(list)
  const ws = XLSX.utils.json_to_sheet(rows)

  // ปรับความกว้างคอลัมน์
  const colWidths = Object.keys(rows[0]).map(k => ({ wch: Math.max(k.length * 1.8, 12) }))
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานลูกค้า')
  XLSX.writeFile(wb, `customers_${new Date().toISOString().slice(0,10)}.xlsx`)
}

export function exportJSON() {
  const blob = new Blob([JSON.stringify(getCustomers(), null, 2)], { type: 'application/json' })
  const a = Object.assign(document.createElement('a'), {
    href: URL.createObjectURL(blob),
    download: `customers_${new Date().toISOString().slice(0,10)}.json`,
  })
  a.click(); URL.revokeObjectURL(a.href)
}

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = e => {
      try {
        const data = JSON.parse(e.target.result)
        if (!Array.isArray(data)) throw new Error()
        localStorage.setItem(KEY, JSON.stringify(data))
        resolve(data.length)
      } catch { reject(new Error('ไฟล์ไม่ถูกต้อง')) }
    }
    r.readAsText(file)
  })
}
