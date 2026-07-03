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
  type: 'agent' | 'farmer' | 'delivery' | 'payment' | 'produce' | 'alert';
  title: string;
  description: string;
  time: string;
  icon: string;
  iconColor: string;
  user?: string;
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
  agents: number;
  produce: number;
  revenue: number;
}
