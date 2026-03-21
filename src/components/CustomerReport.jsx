import { useState, useEffect } from 'react'
import { getCustomers, deleteCustomer, exportCSV, exportExcel, exportJSON, importJSON } from '../customerStorage'
import { VEHICLE_TYPES, VEHICLE_LABELS } from '../defaults'

function fmt(n, d=0) { return isFinite(n)&&!isNaN(n) ? n.toLocaleString('th-TH',{minimumFractionDigits:d,maximumFractionDigits:d}) : '-' }

export default function CustomerReport() {
  const [customers, setCustomers] = useState([])
  const [search, setSearch] = useState('')
  const [expandId, setExpandId] = useState(null)

  useEffect(() => { setCustomers(getCustomers()) }, [])

  const filtered = customers.filter(c =>
    !search || [c.customerName, c.customerCode, c.province, c.address]
      .some(v => v?.toLowerCase().includes(search.toLowerCase()))
  )

  const handleDelete = (id) => {
    if (!confirm('ลบข้อมูลลูกค้านี้?')) return
    deleteCustomer(id)
    setCustomers(getCustomers())
  }

  const handleImport = async (e) => {
    const file = e.target.files[0]; if (!file) return
    try {
      const count = await importJSON(file)
      alert(`นำเข้าสำเร็จ ${count} รายการ`)
      setCustomers(getCustomers())
    } catch (err) { alert(err.message) }
    e.target.value = ''
  }

  return (
    <div className="report-page">
      <div className="report-toolbar">
        <div className="report-search">
          <span>🔍</span>
          <input placeholder="ค้นหา ชื่อ / รหัส / จังหวัด..." value={search} onChange={e=>setSearch(e.target.value)} />
          {search && <button onClick={()=>setSearch('')}>✕</button>}
        </div>
        <div className="report-count">{filtered.length} / {customers.length} รายการ</div>
        <div className="report-actions">
          <button className="rbtn rbtn-excel" onClick={exportExcel} title="Export Excel (.xlsx)">📗 Export Excel</button>
          <button className="rbtn rbtn-csv" onClick={exportCSV} title="Export CSV">📊 Export CSV</button>
          <button className="rbtn rbtn-json" onClick={exportJSON} title="Backup JSON">💾 Backup</button>
          <label className="rbtn rbtn-import" title="Import JSON">
            📂 Import
            <input type="file" accept=".json" onChange={handleImport} style={{display:'none'}} />
          </label>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="report-empty">
          <div>{customers.length === 0 ? '📋' : '🔍'}</div>
          <p>{customers.length === 0 ? 'ยังไม่มีข้อมูลลูกค้า' : 'ไม่พบข้อมูลที่ค้นหา'}</p>
          {customers.length === 0 && <p>กรอกข้อมูลที่หน้า "คำนวนค่าขนส่ง" แล้วกด บันทึกลูกค้า</p>}
        </div>
      ) : (
        <div className="report-table-wrap">
          <table className="report-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>รหัส</th>
                <th>ชื่อลูกค้า</th>
                <th>จังหวัด</th>
                <th>ระยะ</th>
                <th>น้ำหนัก</th>
                <th>4ล้อ /เที่ยว<br/><span className="th-sub">/ตัน (2.5ตัน)</span></th>
                <th>6ล้อ /เที่ยว<br/><span className="th-sub">/ตัน (7 ตัน)</span></th>
                <th>10ล้อ /เที่ยว<br/><span className="th-sub">/ตัน (12 ตัน)</span></th>
                <th>12ล้อ /เที่ยว<br/><span className="th-sub">/ตัน (15ตัน)</span></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const isExp = expandId === c.id
                return (
                  <>
                    <tr key={c.id} className={`rrow ${isExp?'expanded':''}`} onClick={()=>setExpandId(isExp?null:c.id)}>
                      <td>{c.calculationDate}</td>
                      <td><span className="rcode">{c.customerCode||'-'}</span></td>
                      <td className="rname">{c.customerName}</td>
                      <td>{c.province||'-'}</td>
                      <td>{(parseFloat(c.distanceGo)||0)+(parseFloat(c.distanceReturn)||0)} กม.</td>
                      <td>{c.actualWeight||0} ตัน</td>
                      {VEHICLE_TYPES.map(t => (
                        <td key={t} className="rprice">
                          <div className="rprice-inner">
                            <span className="rprice-trip">{fmt(c.results?.[t]?.totalCost,0)}</span>
                            <span className="rprice-ton">
                              {fmt(c.results?.[t]?.costPerTon,0)}
                              <span className="rprice-wt">({c.results?.[t]?.effectiveWeight ?? '-'})</span>
                            </span>
                          </div>
                        </td>
                      ))}
                      <td>
                        <button className="rbtn-del" onClick={e=>{e.stopPropagation();handleDelete(c.id)}}>🗑</button>
                      </td>
                    </tr>
                    {isExp && (
                      <tr key={c.id+'_exp'} className="rrow-detail">
                        <td colSpan={11}>
                          <div className="rdetail">
                            <div className="rdetail-col">
                              <div><span>ที่อยู่:</span> {c.address||'-'}</div>
                              <div><span>ค่าทางด่วน:</span> {fmt(c.toll,0)} บาท</div>
                              <div><span>ใช้ Min Weight:</span> {c.useMinWeight?'ใช่':'ไม่'}</div>
                            </div>
                            <div className="rdetail-col">
                              <div><span>ราคาน้ำมัน:</span> {c.fuelPrice || '-'} บาท/ล.</div>
                              {VEHICLE_TYPES.map(t => (
                                <div key={t}><span>{VEHICLE_LABELS[t]}:</span> {fmt(c.results?.[t]?.totalCost,2)} บาท/เที่ยว | {fmt(c.results?.[t]?.costPerTon,2)} บาท/ตัน</div>
                              ))}
                            </div>
                            {c.remarks && <div className="rdetail-col"><span>หมายเหตุ:</span> {c.remarks}</div>}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
