import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaHome, FaUsers, FaChartLine, FaCog, FaExchangeAlt, FaChevronLeft, FaChevronRight, FaMoneyBillWave } from 'react-icons/fa';
import { AdminSidebarProvider, useAdminSidebar } from '@/contexts/AdminSidebarContext';

const menuItems = [
  { icon: FaHome, label: 'Dashboard', href: '/admin/dashboard' },
  { icon: FaUsers, label: 'Users', href: '/admin/users' },
  { icon: FaExchangeAlt, label: 'Transactions', href: '/admin/transactions' },
  { icon: FaChartLine, label: 'Analytics', href: '/admin/analytics' },
  { icon: FaCog, label: 'Settings', href: '/admin/settings' },
];

// Create a separate component for the admin layout content
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isCollapsed, setIsCollapsed } = useAdminSidebar();

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar */}
      <motion.div 
        initial={{ width: 256 }}
        animate={{ width: isCollapsed ? 80 : 256 }}
        transition={{ duration: 0.3 }}
        className="fixed top-[64px] left-0 h-[calc(100vh-64px)] bg-white shadow-md p-4 z-40 flex flex-col"
      >
        {/* Content */}
        <div className={`mb-8 overflow-hidden whitespace-nowrap ${isCollapsed ? 'text-center' : ''}`}>
          <h1 className="text-2xl font-bold text-gray-900">
            {isCollapsed ? 'AP' : 'Admin Panel'}
          </h1>
        </div>
        
        <nav className="space-y-2 flex-1 mb-16">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = router.pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative group ${
                  isActive 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-600 hover:bg-gray-100 hover:text-purple-600'
                }`}
              >
                <Icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : ''}`} />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
                {isCollapsed && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-800 text-white text-sm rounded opacity-0 pointer-events-none whitespace-nowrap group-hover:opacity-100 transition-opacity">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`absolute right-4 bottom-4 bg-purple-600 text-white rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-purple-700 group`}
        >
          <div className="relative">
            {isCollapsed ? (
              <FaChevronRight className="w-4 h-4" />
            ) : (
              <FaChevronLeft className="w-4 h-4" />
            )}
          </div>
        </button>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1">
        <motion.div 
          className="min-h-[calc(100vh-64px)] bg-white"
          initial={{ marginLeft: 256 }}
          animate={{ marginLeft: isCollapsed ? 80 : 256 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// Main AdminLayout component that provides the context
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminSidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminSidebarProvider>
  );
}