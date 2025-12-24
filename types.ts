
export interface StatItem {
  id: string;
  label: string;
  value: string | number;
  icon: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'stable' | 'urgent';
  color: string;
}

export interface Visit {
  id:string;
  date: string; // ISO YYYY-MM-DD
  dayName: string;
  month: string;
  year: string;
  time: string;
  congregation: string;
  speakerId?: string;
  speakerName: string;
  discoursNumber?: number;
  discoursTitle?: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled' | 'New';
  meetingType: 'Physique' | 'Zoom' | 'Hybride';
  hostId?: string;
  hostName?: string;
  notes?: string;
}

export interface Speaker {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  congregation: string;
  status: 'Actif' | 'Inactif' | 'En pause';
  avatar?: string;
  initials?: string;
  statusColor?: string;
  visits?: number;
  lastContact?: string;
  email?: string;
  phone?: string;
}

export interface Host {
  id: string;
  name: string;
  location: string;
  capacity: number;
  capacityIcon: string;
  available: boolean;
  avatar?: string;
  initials?: string;
  gradient?: string;
  email?: string;
  phone?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  visitId?: string;
  speakerId?: string;
}

export interface SyncConfig {
  sheetId: string;
  visitsGid: string;
  lastSync: string | null;
  autoSync: boolean;
}

export interface AppSettings {
  congregationName: string;
  city: string;
  userName: string;
  notifications: {
    push: boolean;
    confirmations: boolean;
    cancellations: boolean;
    newAssignments: boolean;
    reminders: {
      enabled: boolean;
      sevenDays: boolean;
      threeDays: boolean;
      oneDay: boolean;
    };
  };
}

export type TabType = 'dashboard' | 'planning' | 'speakers' | 'hosts' | 'messages' | 'settings';

// Props for navigation
export type NavigationProps = {
  action?: 'add';
  host?: Host;
  speaker?: Speaker;
  hostId?: string;
  speakerId?: string;
  visitId?: string;
  filter?: {
    status?: string;
    dateRange?: { start: string; end: string };
    hostId?: string;
  };
  search?: string;
}
