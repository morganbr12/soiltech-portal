export interface KpiCard {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  trend: number;
  trendLabel: string;
  color: string;
  bgColor: string;
  route?: string;
}

export interface RecentActivity {
  id: string;
  type: string;
  title: string;
  description: string;
  time: string;
  icon: string;
  iconColor: string;
  user?: string | null;
}

export interface SystemAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  time: string;
  dismissed?: boolean;
}

export interface RegionData {
  region: string;
  farmers: number;
  agents?: number;
  produce: number;
  revenue: number;
}

// ── API response types ─────────────────────────────────────────────────────

export interface DashboardKpis {
  totalLbcs: number;              totalLbcsTrend: number;
  activeAgents: number;           activeAgentsTrend: number;
  registeredFarmers: number;      registeredFarmersTrend: number;
  registeredFarms: number;        registeredFarmsTrend: number;
  todaysCollection: number;       todaysCollectionTrend: number;
  vehiclesOnRoute: number;        vehiclesOnRouteTrend: number;
  driversOnline: number;          driversOnlineTrend: number;
  deliveriesToday: number;        deliveriesTodayTrend: number;
  warehouseCapacity: number;      warehouseCapacityTrend: number;
  todaysRevenue: number;          todaysRevenueTrend: number;
  paymentsPending: number;        paymentsPendingTrend: number;
  failedDeliveries: number;       failedDeliveriesTrend: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  monthlyCollection: { cocoa: number[]; coffee: number[]; cashew: number[] };
  deliveryStatus: {
    delivered: number; inTransit: number; scheduled: number;
    failed: number; returned: number;
  };
  monthlyRevenue: { months: string[]; revenue: number[]; target: number[] };
  regionalOverview: RegionData[];
  recentActivity: RecentActivity[];
  systemAlerts: SystemAlert[];
}
