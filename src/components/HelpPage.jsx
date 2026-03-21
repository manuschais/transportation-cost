export default function HelpPage() {
  return (
    <div className="help-page">
      <div className="help-container">
        <h2 className="help-title">📖 คู่มือการใช้งาน</h2>

        <div className="help-section">
          <h3>1. การตั้งค่าราคาน้ำมัน</h3>
          <p>ราคาน้ำมันดีเซลอยู่ที่ <strong>แถบด้านบน (Header)</strong> ตรงกลางหน้าจอ</p>
          <ul>
            <li>พิมพ์ราคาน้ำมันปัจจุบัน เช่น <code>33.50</code></li>
            <li>ระบบจะอัปเดตการคำนวนทุกประเภทรถทันที</li>
            <li>ราคานี้จะถูกบันทึกไปพร้อมกับข้อมูลลูกค้าเมื่อกด "บันทึกลูกค้า"</li>
          </ul>
        </div>

        <div className="help-section">
          <h3>2. การป้อนข้อมูลและคำนวนค่าขนส่ง</h3>
          <p>ไปที่แท็บ <strong>🧮 คำนวนค่าขนส่ง</strong></p>
          <table className="help-table">
            <thead>
              <tr><th>ช่องข้อมูล</th><th>คำอธิบาย</th></tr>
            </thead>
            <tbody>
              <tr><td>ระยะทางไป</td><td>ระยะจากโกดังถึงลูกค้า (กม.)</td></tr>
              <tr><td>ระยะทางกลับ</td><td>ระยะขากลับ — หากเว้นว่างจะใช้ค่าเดียวกับขาไป</td></tr>
              <tr><td>ค่าทางด่วน</td><td>รวมทั้งไปและกลับ (บาท)</td></tr>
              <tr><td>น้ำหนักบรรทุก</td><td>น้ำหนักสินค้าจริง (ตัน)</td></tr>
              <tr><td>ใช้ Min Weight</td><td>ติ๊กเพื่อใช้น้ำหนักขั้นต่ำตามประเภทรถ</td></tr>
            </tbody>
          </table>
          <p>ระบบจะ <strong>คำนวนอัตโนมัติ</strong> เมื่อกรอกระยะทาง ผลลัพธ์แสดงพร้อมกันทั้ง 4 ประเภทรถ ได้แก่ รถ 4 ล้อ / 6 ล้อ / 10 ล้อ / 12 ล้อ แต่ละประเภทแสดง <strong>ราคา/เที่ยว</strong> และ <strong>ราคา/ตัน</strong> พร้อมแถบสัดส่วนต้นทุน</p>
        </div>

        <div className="help-section">
          <h3>3. บันทึกข้อมูลลูกค้า</h3>
          <p>เมื่อคำนวนแล้ว กด <strong>💾 บันทึกลูกค้า</strong> ที่ด้านล่าง กรอกข้อมูล:</p>
          <ul>
            <li>รหัสลูกค้า (ไม่บังคับ) เช่น <code>C001</code></li>
            <li>ชื่อลูกค้า <strong>(บังคับ)</strong></li>
            <li>ที่อยู่ / จังหวัด / หมายเหตุ</li>
          </ul>
          <p>กด <strong>บันทึก</strong> — ข้อมูลจะถูกบันทึกพร้อมราคาน้ำมัน ณ วันนั้นไว้ในรายงาน</p>
        </div>

        <div className="help-section">
          <h3>4. รายงานลูกค้าและการค้นหา</h3>
          <p>ไปที่แท็บ <strong>📋 รายงานลูกค้า</strong></p>
          <ul>
            <li>พิมพ์ในช่อง 🔍 เพื่อกรองจาก <strong>ชื่อลูกค้า / รหัส / จังหวัด / ที่อยู่</strong></li>
            <li>กด <code>✕</code> เพื่อล้างคำค้นหา</li>
            <li>มุมซ้ายบนแสดงจำนวน เช่น <code>3 / 50 รายการ</code></li>
            <li><strong>คลิกที่แถว</strong> เพื่อขยายดูรายละเอียดเพิ่มเติม</li>
          </ul>
        </div>

        <div className="help-section">
          <h3>5. แก้ไขข้อมูลลูกค้า</h3>
          <p>กด <strong>✏️</strong> ที่ท้ายแถวเพื่อเปิดหน้าต่างแก้ไข สามารถแก้ไขได้ทุกช่อง จากนั้นกด <strong>🔄 คำนวนราคาใหม่</strong> เพื่ออัปเดตราคาก่อนบันทึก</p>
        </div>

        <div className="help-section help-highlight">
          <h3>6. คำนวนใหม่ทั้งหมด (กรณีราคาน้ำมันเปลี่ยน)</h3>
          <p>เมื่อราคาน้ำมันเปลี่ยนและต้องการอัปเดตข้อมูลลูกค้าทุกรายพร้อมกัน:</p>
          <ol>
            <li>เปลี่ยนราคาน้ำมันที่ <strong>Header</strong> ให้เป็นราคาปัจจุบัน</li>
            <li>ไปที่แท็บ <strong>📋 รายงานลูกค้า</strong></li>
            <li>กดปุ่ม <strong>🔄 คำนวนใหม่ทั้งหมด</strong></li>
            <li>ยืนยัน — ระบบจะคำนวนและอัปเดตราคาทุกรายการโดยอัตโนมัติ</li>
          </ol>
          <p className="help-note">⚠️ การคำนวนใหม่จะใช้ <strong>ต้นทุนปัจจุบันทั้งหมด</strong> (ราคาน้ำมัน, Overhead, ค่าเสื่อม ฯลฯ) ระยะทางและน้ำหนักเดิมของลูกค้าแต่ละรายจะยังคงเดิม</p>
        </div>

        <div className="help-section">
          <h3>7. Export / Import ข้อมูล</h3>
          <table className="help-table">
            <thead>
              <tr><th>ปุ่ม</th><th>ฟังก์ชัน</th></tr>
            </thead>
            <tbody>
              <tr><td>📗 Export Excel</td><td>ส่งออกเป็นไฟล์ .xlsx</td></tr>
              <tr><td>📊 Export CSV</td><td>ส่งออกเป็น .csv เปิดใน Excel ได้</td></tr>
              <tr><td>💾 Backup</td><td>บันทึกข้อมูลเป็น JSON สำรอง</td></tr>
              <tr><td>📂 Import</td><td>นำเข้าไฟล์ JSON ที่ Backup ไว้</td></tr>
            </tbody>
          </table>
        </div>

        <div className="help-section">
          <h3>8. ตั้งค่าต้นทุน</h3>
          <p>ไปที่แท็บ <strong>⚙️ ตั้งค่าต้นทุน</strong> เพื่อปรับ:</p>
          <ul>
            <li><strong>Overhead รวม</strong> — ค่าใช้จ่ายคงที่ต่อเดือน หารด้วยจำนวนเที่ยวรวมทั้งกองทัพ</li>
            <li>ต้นทุนแต่ละประเภทรถ เช่น ค่าแรง ค่าเสื่อม ค่าซ่อม ประกัน ฯลฯ</li>
            <li>สามารถ Export/Import การตั้งค่าเป็น JSON เพื่อสำรองข้อมูลได้</li>
          </ul>
        </div>

      </div>
    </div>
  )
}
