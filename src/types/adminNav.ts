export interface AdminNavItemConfig {
  id: string;
  label: string;
  iconName: string;
  visible: boolean;
  locked?: boolean;
}

export interface AdminNavGroupConfig {
  id: string;
  label: string;
  icon: string;
  collapsed?: boolean;
  visible: boolean;
  items: AdminNavItemConfig[];
}

export interface AdminNavConfig {
  groups: AdminNavGroupConfig[];
  updatedAt?: string;
  updatedBy?: string;
}
