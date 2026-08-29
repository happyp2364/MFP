import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuditLogItem } from '../types';
import { fetchRemoteAuditLogs } from '../lib/firebase';

interface AuditContextType {
  auditLogs: AuditLogItem[];
  refreshAuditLogs: () => Promise<void>;
}

const AuditContext = createContext<AuditContextType | undefined>(undefined);

export const AuditProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const refreshAuditLogs = async () => {
    try {
      const logs = await fetchRemoteAuditLogs();
      setAuditLogs(logs);
    } catch (e) {
      console.warn('Failed to fetch audit logs', e);
    }
  };

  useEffect(() => {
    refreshAuditLogs();
  }, []);

  return (
    <AuditContext.Provider value={{ auditLogs, refreshAuditLogs }}>
      {children}
    </AuditContext.Provider>
  );
};

export const useAudit = () => {
  const context = useContext(AuditContext);
  if (!context) throw new Error('useAudit must be used within AuditProvider');
  return context;
};
