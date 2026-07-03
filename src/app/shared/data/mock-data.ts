import { EntityStatus, VehicleStatus, DeliveryStatus, PaymentStatus, ProduceGrade } from '../../core/enums/status.enum';
import { UserRole } from '../../core/enums/roles.enum';

// ─── LBC ─────────────────────────────────────────────────────────────────────
export const MOCK_LBCS = Array.from({ length: 40 }, (_, i) => ({
  id: `LBC-${String(i + 1).padStart(4, '0')}`,
  name: ['Ashanti Gold Buyers', 'Western Cocoa Co.', 'Northern Harvest Ltd', 'Eastern Produce GH', 'Volta Agri Traders', 'Central Farm Buyers', 'Greater Accra LBC', 'Bono Commodity House'][i % 8],
  code: `LBC${String(i + 1).padStart(3, '0')}`,
  region: ['Ashanti', 'Western', 'Northern', 'Eastern', 'Volta', 'Central', 'Greater Accra', 'Brong-Ahafo'][i % 8],
  district: ['Kumasi', 'Takoradi', 'Tamale', 'Koforidua', 'Ho', 'Cape Coast', 'Accra', 'Sunyani'][i % 8],
  manager: ['Kwame Acheampong', 'Efua Mensah', 'Alhassan Ibrahim', 'Kofi Asante', 'Ama Volta', 'Abena Central', 'Kweku Accra', 'Yaa Bono'][i % 8],
  phone: `+233 24 ${String(Math.floor(Math.random() * 9000000 + 1000000))}`,
  email: `info@lbc${i + 1}.gh`,
  agents: Math.floor(Math.random() * 50) + 10,
  farmers: Math.floor(Math.random() * 500) + 100,
  status: i % 7 === 0 ? EntityStatus.SUSPENDED : i % 5 === 0 ? EntityStatus.PENDING : EntityStatus.ACTIVE,
  produceTonnes: parseFloat((Math.random() * 200 + 50).toFixed(1)),
  revenue: Math.floor(Math.random() * 200000 + 50000),
  compliance: Math.floor(Math.random() * 30) + 70,
  joinedDate: new Date(2022, i % 12, (i % 28) + 1).toISOString(),
}));

// ─── Agents ───────────────────────────────────────────────────────────────────
const firstNames = ['Emmanuel', 'Akosua', 'Kwabena', 'Ama', 'Kofi', 'Abena', 'Yaw', 'Afia', 'Kwame', 'Efua', 'Kojo', 'Adwoa', 'Fiifi', 'Akua', 'Ekow'];
const lastNames  = ['Osei', 'Mensah', 'Asante', 'Boateng', 'Darko', 'Agyei', 'Amponsah', 'Asamoah', 'Owusu', 'Frimpong', 'Nkrumah', 'Adjei', 'Bonsu', 'Twum', 'Baidoo'];

export const MOCK_AGENTS = Array.from({ length: 60 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[Math.floor(i / firstNames.length) % lastNames.length];
  return {
    id: `AGT-${String(i + 1).padStart(4, '0')}`,
    firstName: fn, lastName: ln, fullName: `${fn} ${ln}`,
    phone: `+233 24 ${String(Math.floor(Math.random() * 9000000 + 1000000))}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@agents.soiltech.com`,
    lbcId: `LBC-${String((i % 40) + 1).padStart(4, '0')}`,
    lbcName: MOCK_LBCS[i % 40].name,
    region: ['Ashanti', 'Western', 'Northern', 'Eastern', 'Volta', 'Central'][i % 6],
    district: ['Kumasi', 'Takoradi', 'Tamale', 'Koforidua', 'Ho', 'Cape Coast'][i % 6],
    farmersCount: Math.floor(Math.random() * 80) + 10,
    farmsCount: Math.floor(Math.random() * 100) + 15,
    status: i % 8 === 0 ? EntityStatus.INACTIVE : EntityStatus.ACTIVE,
    lat: 5.5 + Math.random() * 4,
    lng: -2.5 + Math.random() * 3,
    lastSeen: new Date(Date.now() - Math.random() * 86400000).toISOString(),
    joinedDate: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
    produceCollected: parseFloat((Math.random() * 50 + 5).toFixed(1)),
  };
});

// ─── Farmers ──────────────────────────────────────────────────────────────────
export const MOCK_FARMERS = Array.from({ length: 80 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i + 3) % lastNames.length];
  return {
    id: `FMR-${String(i + 1).padStart(5, '0')}`,
    firstName: fn, lastName: ln, fullName: `${fn} ${ln}`,
    phone: `+233 24 ${String(Math.floor(Math.random() * 9000000 + 1000000))}`,
    nationalId: `GHA-${String(Math.floor(Math.random() * 9000000000 + 1000000000))}`,
    agentId: `AGT-${String((i % 60) + 1).padStart(4, '0')}`,
    agentName: MOCK_AGENTS[i % 60].fullName,
    lbcId: `LBC-${String((i % 40) + 1).padStart(4, '0')}`,
    region: ['Ashanti', 'Western', 'Northern', 'Eastern', 'Volta', 'Central', 'Greater Accra', 'Brong-Ahafo'][i % 8],
    farmsCount: Math.floor(Math.random() * 5) + 1,
    totalFarmSize: parseFloat((Math.random() * 15 + 1).toFixed(1)),
    cropTypes: [['Cocoa', 'Coffee'], ['Cashew', 'Shea'], ['Maize', 'Cassava'], ['Cocoa'], ['Cashew']][i % 5],
    status: i % 12 === 0 ? EntityStatus.PENDING : i % 20 === 0 ? EntityStatus.REJECTED : EntityStatus.APPROVED,
    walletBalance: Math.floor(Math.random() * 5000) + 500,
    totalEarnings: Math.floor(Math.random() * 50000) + 5000,
    joinedDate: new Date(2022, i % 12, (i % 28) + 1).toISOString(),
    kycVerified: i % 15 !== 0,
  };
});

// ─── Farms ────────────────────────────────────────────────────────────────────
export const MOCK_FARMS = Array.from({ length: 60 }, (_, i) => ({
  id: `FM-${String(i + 1).padStart(5, '0')}`,
  name: `${['Osei', 'Mensah', 'Asante', 'Boateng', 'Darko'][i % 5]} Farm ${i + 1}`,
  farmerId: `FMR-${String((i % 80) + 1).padStart(5, '0')}`,
  farmerName: MOCK_FARMERS[i % 80].fullName,
  region: ['Ashanti', 'Western', 'Northern', 'Eastern', 'Volta', 'Central'][i % 6],
  district: ['Kumasi Metro', 'Takoradi', 'Tamale Metro', 'New Juaben', 'Ho Municipal', 'Cape Coast'][i % 6],
  sizeHectares: parseFloat((Math.random() * 10 + 0.5).toFixed(2)),
  cropType: ['Cocoa', 'Coffee', 'Cashew', 'Shea', 'Maize', 'Cocoa'][i % 6],
  lat: 5.5 + Math.random() * 4,
  lng: -2.5 + Math.random() * 3,
  status: EntityStatus.ACTIVE,
  lastHarvestDate: new Date(2025, i % 12, (i % 28) + 1).toISOString(),
  estimatedYield: parseFloat((Math.random() * 5 + 0.5).toFixed(1)),
  registeredDate: new Date(2022, i % 12, (i % 28) + 1).toISOString(),
}));

// ─── Produce ──────────────────────────────────────────────────────────────────
export const MOCK_PRODUCE = Array.from({ length: 50 }, (_, i) => ({
  id: `PRD-${String(i + 1).padStart(5, '0')}`,
  farmId: `FM-${String((i % 60) + 1).padStart(5, '0')}`,
  farmerId: `FMR-${String((i % 80) + 1).padStart(5, '0')}`,
  farmerName: MOCK_FARMERS[i % 80].fullName,
  agentId: `AGT-${String((i % 60) + 1).padStart(4, '0')}`,
  agentName: MOCK_AGENTS[i % 60].fullName,
  cropType: ['Cocoa', 'Coffee', 'Cashew', 'Shea'][i % 4],
  grade: [ProduceGrade.A, ProduceGrade.B, ProduceGrade.C, ProduceGrade.REJECTED][i % 4],
  weightKg: parseFloat((Math.random() * 500 + 50).toFixed(1)),
  pricePerKg: [8.50, 12.00, 6.75, 5.20][i % 4],
  totalValue: 0,
  warehouseId: `WH-${String((i % 10) + 1).padStart(3, '0')}`,
  collectionDate: new Date(Date.now() - i * 3600000).toISOString(),
  status: ['pending', 'inspected', 'stored', 'dispatched'][i % 4],
})).map(p => ({ ...p, totalValue: parseFloat((p.weightKg * p.pricePerKg).toFixed(2)) }));

// ─── Vehicles ─────────────────────────────────────────────────────────────────
export const MOCK_VEHICLES = Array.from({ length: 30 }, (_, i) => ({
  id: `VEH-${String(i + 1).padStart(3, '0')}`,
  plateNumber: `GR-${Math.floor(Math.random() * 9000 + 1000)}-${['20', '21', '22', '23'][i % 4]}`,
  type: ['Pickup Truck', 'Mini Truck', 'Large Truck', 'Van'][i % 4],
  make: ['Toyota', 'Isuzu', 'Ford', 'Mercedes', 'Mitsubishi'][i % 5],
  model: ['Hilux', 'NPR', 'Ranger', 'Sprinter', 'L200'][i % 5],
  year: 2018 + (i % 6),
  capacityKg: [1000, 2000, 5000, 800][i % 4],
  status: [VehicleStatus.AVAILABLE, VehicleStatus.ON_ROUTE, VehicleStatus.MAINTENANCE, VehicleStatus.OFFLINE][i % 4],
  driverId: `DRV-${String((i % 25) + 1).padStart(3, '0')}`,
  region: ['Ashanti', 'Western', 'Northern', 'Eastern'][i % 4],
  lastMaintenanceDate: new Date(2025, i % 12, 1).toISOString(),
  fuelLevel: Math.floor(Math.random() * 80) + 20,
  lat: 5.5 + Math.random() * 4,
  lng: -2.5 + Math.random() * 3,
}));

// ─── Payments ─────────────────────────────────────────────────────────────────
export const MOCK_PAYMENTS = Array.from({ length: 50 }, (_, i) => ({
  id: `PAY-${String(i + 1).padStart(6, '0')}`,
  farmerId: `FMR-${String((i % 80) + 1).padStart(5, '0')}`,
  farmerName: MOCK_FARMERS[i % 80].fullName,
  lbcId: `LBC-${String((i % 40) + 1).padStart(4, '0')}`,
  amount: parseFloat((Math.random() * 5000 + 200).toFixed(2)),
  currency: 'GHS',
  method: ['Mobile Money', 'Bank Transfer', 'Cash', 'Wallet'][i % 4],
  status: [PaymentStatus.COMPLETED, PaymentStatus.PENDING, PaymentStatus.PROCESSING, PaymentStatus.FAILED][i % 4],
  reference: `REF${Date.now().toString().slice(-8)}${i}`,
  createdAt: new Date(Date.now() - i * 3600000 * 2).toISOString(),
  processedAt: i % 4 === 0 ? null : new Date(Date.now() - i * 3600000).toISOString(),
}));

// ─── Warehouses ───────────────────────────────────────────────────────────────
export const MOCK_WAREHOUSES = Array.from({ length: 12 }, (_, i) => ({
  id: `WH-${String(i + 1).padStart(3, '0')}`,
  name: ['Kumasi Central Warehouse', 'Accra South Hub', 'Takoradi Port Store', 'Tamale Regional Depot', 'Ho Volta Facility', 'Cape Coast Store', 'Koforidua East Depot', 'Sunyani Bono Hub', 'Wa Upper West Store', 'Bolgatanga NE Depot', 'Hohoe Volta Depot', 'Tarkwa Gold Route Hub'][i],
  region: ['Ashanti', 'Greater Accra', 'Western', 'Northern', 'Volta', 'Central', 'Eastern', 'Brong-Ahafo', 'Upper West', 'Upper East', 'Volta', 'Western'][i],
  address: `${['12', '45', '8', '22', '3', '17'][i % 6]} Industrial Area, Ghana`,
  capacityTonnes: [500, 800, 1200, 600, 400, 350, 450, 550, 300, 280, 320, 480][i],
  usedTonnes: parseFloat((([350, 680, 840, 380, 240, 180, 320, 410, 180, 160, 220, 320][i])).toFixed(1)),
  manager: MOCK_AGENTS[i % 60].fullName,
  status: EntityStatus.ACTIVE,
  lat: 5.5 + i * 0.4,
  lng: -2.5 + i * 0.2,
  phone: `+233 24 ${String(Math.floor(Math.random() * 9000000 + 1000000))}`,
})).map(w => ({ ...w, capacityPercent: parseFloat(((w.usedTonnes / w.capacityTonnes) * 100).toFixed(1)) }));

// ─── Users (portal users) ─────────────────────────────────────────────────────
export const MOCK_PORTAL_USERS = Array.from({ length: 25 }, (_, i) => {
  const fn = firstNames[i % firstNames.length];
  const ln = lastNames[(i + 5) % lastNames.length];
  return {
    id: `USR-${String(i + 1).padStart(4, '0')}`,
    firstName: fn, lastName: ln, fullName: `${fn} ${ln}`,
    email: `${fn.toLowerCase()}.${ln.toLowerCase()}@soiltech.com`,
    phone: `+233 24 ${String(Math.floor(Math.random() * 9000000 + 1000000))}`,
    role: Object.values(UserRole)[i % Object.values(UserRole).length],
    status: i % 10 === 0 ? EntityStatus.INACTIVE : EntityStatus.ACTIVE,
    region: ['Ashanti', 'Western', 'Northern', 'Eastern', 'Volta', 'Central', 'Greater Accra', 'Brong-Ahafo'][i % 8],
    lastLogin: new Date(Date.now() - Math.random() * 7 * 86400000).toISOString(),
    createdAt: new Date(2023, i % 12, (i % 28) + 1).toISOString(),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${fn}${i}`,
  };
});
