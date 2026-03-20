/**
 * คำนวนต้นทุนค่าขนส่งต่อเที่ยว
 * @param {object} vehicle - ข้อมูลตั้งค่าต้นทุนรถ
 * @param {object} trip - ข้อมูลเที่ยววิ่ง
 */
export function calculateTrip(vehicle, trip) {
  const { distanceGo, distanceReturn, tollGo, tollReturn, actualWeight, cargoValue, useMinWeight } = trip

  const distGo = parseFloat(distanceGo) || 0
  const distReturn = parseFloat(distanceReturn) || distGo
  const totalDistance = distGo + distReturn

  // ค่าน้ำมัน
  const fuelCost = (totalDistance / 100) * (vehicle.fuelConsumption || 0) * (vehicle.fuelPrice || 0)

  // ค่าแรง
  const laborCost = parseFloat(vehicle.laborPerTrip) || 0

  // ค่าทางด่วน
  const tollCost = (parseFloat(tollGo) || 0) + (parseFloat(tollReturn) || 0)

  // ค่าเสื่อมราคา (ราคารถ / อายุใช้งาน / 12เดือน / จำนวนเที่ยวต่อเดือน)
  const tripsPerMonth = parseFloat(vehicle.tripsPerMonth) || 1
  const depreciationPerTrip =
    (parseFloat(vehicle.vehicleCost) || 0) /
    ((parseFloat(vehicle.usefulLifeYears) || 1) * 12 * tripsPerMonth)

  // ค่าบำรุงรักษา (น้ำมันเครื่อง, ยาง, ฟิลเตอร์)
  const maintenanceCost = totalDistance * (parseFloat(vehicle.maintenancePerKm) || 0)

  // ค่าซ่อม
  const repairCost = totalDistance * (parseFloat(vehicle.repairPerKm) || 0)

  // ค่าประกันรถ (แบ่งเฉลี่ยต่อเที่ยว)
  const insurancePerTrip =
    (parseFloat(vehicle.vehicleInsurancePerYear) || 0) / (12 * tripsPerMonth)

  // ค่าต่อภาษี (แบ่งเฉลี่ยต่อเที่ยว)
  const taxPerTrip =
    (parseFloat(vehicle.taxRenewalPerYear) || 0) / (12 * tripsPerMonth)

  // ประกันสินค้า
  const cargoInsuranceCost =
    (parseFloat(cargoValue) || 0) * ((parseFloat(vehicle.cargoInsuranceRate) || 0) / 100)

  const totalCost =
    fuelCost +
    laborCost +
    tollCost +
    depreciationPerTrip +
    maintenanceCost +
    repairCost +
    insurancePerTrip +
    taxPerTrip +
    cargoInsuranceCost

  // น้ำหนักที่ใช้คำนวน
  const weight = parseFloat(actualWeight) || 0
  const minWeight = parseFloat(vehicle.minWeight) || 0
  const effectiveWeight = useMinWeight ? Math.max(weight, minWeight) : weight

  const costPerTon = effectiveWeight > 0 ? totalCost / effectiveWeight : 0

  return {
    breakdown: {
      fuelCost,
      laborCost,
      tollCost,
      depreciationPerTrip,
      maintenanceCost,
      repairCost,
      insurancePerTrip,
      taxPerTrip,
      cargoInsuranceCost,
    },
    totalCost,
    effectiveWeight,
    costPerTon,
    totalDistance,
    distGo,
    distReturn,
  }
}
