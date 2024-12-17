import { createContext, useContext, useState } from 'react';

interface AdminSidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (value: boolean) => void;
}

const AdminSidebarContext = createContext<AdminSidebarContextType | undefined>(undefined);

export function AdminSidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <AdminSidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </AdminSidebarContext.Provider>
  );
}

export function useAdminSidebar() {
  const context = useContext(AdminSidebarContext);
  if (context === undefined) {
    throw new Error('useAdminSidebar must be used within an AdminSidebarProvider');
  }
  return context;
} 