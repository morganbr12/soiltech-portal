import { KpiCard, RecentActivity, SystemAlert, RegionData } from '../domain/dashboard.model';

export const MOCK_KPIS: KpiCard[] = [
  { id: '1', title: 'Total LBCs', value: '248', icon: 'business_center', trend: 12, trendLabel: 'vs last month', color: '#1a7a4a', bgColor: 'rgba(26,122,74,0.1)', route: '/lbc' },
  { id: '2', title: 'Active Agents', value: '1,842', icon: 'badge', trend: 8, trendLabel: 'vs last month', color: '#0284c7', bgColor: 'rgba(2,132,199,0.1)', route: '/agents' },
  { id: '3', title: 'Registered Farmers', value: '28,493', icon: 'person_pin', trend: 23, trendLabel: 'vs last month', color: '#7c3aed', bgColor: 'rgba(124,58,237,0.1)', route: '/farmers' },
  { id: '4', title: 'Registered Farms', value: '31,027', icon: 'agriculture', trend: 18, trendLabel: 'vs last month', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', route: '/farms' },
  { id: '5', title: "Today's Collection", value: '342.7t', icon: 'eco', trend: -5, trendLabel: 'vs yesterday', color: '#16a34a', bgColor: 'rgba(22,163,74,0.1)', route: '/produce' },
  { id: '6', title: 'Vehicles on Route', value: '187', icon: 'local_shipping', trend: 4, trendLabel: 'vs yesterday', color: '#0891b2', bgColor: 'rgba(8,145,178,0.1)', route: '/tracking' },
  { id: '7', title: 'Drivers Online', value: '203', icon: 'drive_eta', trend: 2, trendLabel: 'vs yesterday', color: '#64748b', bgColor: 'rgba(100,116,139,0.1)', route: '/logistics' },
  { id: '8', title: 'Deliveries Today', value: '1,204', icon: 'inventory_2', trend: 11, trendLabel: 'vs yesterday', color: '#dc2626', bgColor: 'rgba(220,38,38,0.1)', route: '/logistics' },
  { id: '9', title: 'Warehouse Capacity', value: '68%', icon: 'warehouse', trend: -3, trendLabel: 'fill rate', color: '#d97706', bgColor: 'rgba(217,119,6,0.1)', route: '/warehouses' },
  { id: '10', title: "Today's Revenue", value: '₵842,340', icon: 'payments', trend: 15, trendLabel: 'vs yesterday', color: '#1a7a4a', bgColor: 'rgba(26,122,74,0.1)', route: '/payments' },
  { id: '11', title: 'Payments Pending', value: '₵124,800', icon: 'pending', trend: -8, trendLabel: 'vs yesterday', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)', route: '/payments' },
  { id: '12', title: 'Failed Deliveries', value: '23', icon: 'cancel', trend: -30, trendLabel: 'vs yesterday', color: '#dc2626', bgColor: 'rgba(220,38,38,0.1)', route: '/logistics' },
];

export const MOCK_ACTIVITIES: RecentActivity[] = [
  { id: '1', type: 'agent', title: 'New Agent Registered', description: 'Emmanuel Osei onboarded to Ashanti Region LBC #023', time: '2 min ago', icon: 'badge', iconColor: '#0284c7', user: 'Abena M.' },
  { id: '2', type: 'delivery', title: 'Delivery Completed', description: 'Trip #TRP-8821 delivered 2.4t of cocoa to Kumasi Warehouse', time: '8 min ago', icon: 'local_shipping', iconColor: '#16a34a' },
  { id: '3', type: 'payment', title: 'Payment Approved', description: '₵12,450 approved for 18 farmers in Western Region', time: '15 min ago', icon: 'payments', iconColor: '#1a7a4a', user: 'Kofi B.' },
  { id: '4', type: 'farmer', title: 'Farmer KYC Approved', description: 'Akosua Darko (ID: FMR-48821) profile verified and activated', time: '32 min ago', icon: 'how_to_reg', iconColor: '#7c3aed', user: 'QA Team' },
  { id: '5', type: 'produce', title: 'Quality Rejection', description: '0.8t of produce from Farm #FM-2209 rejected — Grade C', time: '1h ago', icon: 'warning', iconColor: '#dc2626' },
  { id: '6', type: 'alert', title: 'Vehicle Breakdown', description: 'GR-2847-21 reported breakdown near Techiman on Route RT-44', time: '1h 20min ago', icon: 'car_crash', iconColor: '#f59e0b' },
  { id: '7', type: 'delivery', title: 'Warehouse Incoming', description: '12.8t of cashew arrived at Tamale Warehouse from 3 LBCs', time: '2h ago', icon: 'warehouse', iconColor: '#0891b2' },
];

export const MOCK_ALERTS: SystemAlert[] = [
  { id: '1', severity: 'critical', title: 'Payment Gateway Issue', message: 'MoMo gateway experiencing delays — 34 transactions queued', time: '5 min ago' },
  { id: '2', severity: 'warning', title: 'Low Warehouse Capacity', message: 'Accra Central Warehouse at 92% capacity — action required', time: '1h ago' },
  { id: '3', severity: 'warning', title: 'Agent Inactivity Alert', message: '12 agents in Upper West Region inactive for 7+ days', time: '3h ago' },
  { id: '4', severity: 'info', title: 'System Maintenance', message: 'Scheduled downtime: 2026-07-05 02:00–04:00 GMT', time: '1 day ago' },
];

export const MOCK_REGION_DATA: RegionData[] = [
  { region: 'Ashanti', farmers: 5820, agents: 312, produce: 94.2, revenue: 182400 },
  { region: 'Western', farmers: 4210, agents: 248, produce: 78.6, revenue: 152800 },
  { region: 'Eastern', farmers: 3890, agents: 201, produce: 61.4, revenue: 118300 },
  { region: 'Greater Accra', farmers: 1840, agents: 94, produce: 22.1, revenue: 43200 },
  { region: 'Brong-Ahafo', farmers: 3420, agents: 187, produce: 52.8, revenue: 101400 },
  { region: 'Northern', farmers: 2980, agents: 156, produce: 41.3, revenue: 79800 },
  { region: 'Upper East', farmers: 2140, agents: 112, produce: 28.7, revenue: 55300 },
  { region: 'Volta', farmers: 1980, agents: 98, produce: 24.9, revenue: 47900 },
];

export const MONTHLY_COLLECTION_DATA = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  series: [
    { name: 'Cocoa', data: [840, 920, 760, 880, 1040, 980, 1120, 1060, 920, 1180, 1340, 1200] },
    { name: 'Coffee', data: [240, 280, 210, 260, 310, 290, 330, 305, 270, 350, 390, 360] },
    { name: 'Cashew', data: [180, 210, 155, 195, 230, 215, 245, 230, 200, 260, 295, 270] },
  ],
};

export const DELIVERY_STATUS_DATA = {
  labels: ['Delivered', 'In Transit', 'Scheduled', 'Failed', 'Returned'],
  values: [68, 18, 9, 3, 2],
  colors: ['#16a34a', '#0284c7', '#7c3aed', '#dc2626', '#f59e0b'],
};

export const REVENUE_TREND_DATA = {
  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
  revenue: [612400, 688300, 721800, 698500, 754200, 812300, 842340],
  target: [650000, 700000, 720000, 730000, 750000, 800000, 830000],
};
