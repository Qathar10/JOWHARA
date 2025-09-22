import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Award, 
  Users, 
  ShoppingCart, 
  Database,
  Settings,
  LogOut
} from 'lucide-react';
import { signOut } from '../../lib/auth';

interface AdminSidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPage, onNavigate }) => {
  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
    { id: 'categories', name: 'Categories', icon: Package },
    { id: 'products', name: 'Products', icon: Package },
    { id: 'brands', name: 'Brands', icon: Award },
    { id: 'customers', name: 'Customers', icon: Users },
    { id: 'orders', name: 'Orders', icon: ShoppingCart },
    { id: 'connection-test', name: 'Connection Test', icon: Database },
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate('home');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="bg-white shadow-sm border-r border-gray-200 w-64 min-h-screen">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
            <Settings className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-black">Admin Panel</h1>
            <p className="text-xs text-gray-500">Jowhara Collection</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <div className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 ${
                  isActive
                    ? 'bg-black text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.name}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

export default AdminSidebar;