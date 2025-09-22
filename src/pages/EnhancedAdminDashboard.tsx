import React, { useState, useEffect } from 'react';
import { isAdmin, type User } from '../lib/auth';
import AdminSidebar from '../components/admin/AdminSidebar';
import CategoryManager from '../components/admin/CategoryManager';
import ConnectionTest from './ConnectionTest';

interface EnhancedAdminDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

const EnhancedAdminDashboard: React.FC<EnhancedAdminDashboardProps> = ({ user, onNavigate }) => {
  const [currentPage, setCurrentPage] = useState('dashboard');

  // Check if user has admin access
  useEffect(() => {
    if (!isAdmin(user)) {
      onNavigate('admin/login');
      return;
    }
  }, [user, onNavigate]);

  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin dashboard.</p>
          <button
            onClick={() => onNavigate('admin/login')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  const handlePageChange = (page: string) => {
    if (page === 'connection-test') {
      onNavigate('connection-test');
    } else {
      setCurrentPage(page);
    }
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'categories':
        return <CategoryManager />;
      case 'products':
        return <div className="p-6"><h1 className="text-2xl font-bold">Products Management</h1><p>Coming soon...</p></div>;
      case 'brands':
        return <div className="p-6"><h1 className="text-2xl font-bold">Brands Management</h1><p>Coming soon...</p></div>;
      case 'customers':
        return <div className="p-6"><h1 className="text-2xl font-bold">Customers Management</h1><p>Coming soon...</p></div>;
      case 'orders':
        return <div className="p-6"><h1 className="text-2xl font-bold">Orders Management</h1><p>Coming soon...</p></div>;
      default:
        return (
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories</h3>
                <p className="text-3xl font-bold text-blue-600">6</p>
                <p className="text-sm text-gray-600">Product categories</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Products</h3>
                <p className="text-3xl font-bold text-green-600">24</p>
                <p className="text-sm text-gray-600">Total products</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Orders</h3>
                <p className="text-3xl font-bold text-yellow-600">12</p>
                <p className="text-sm text-gray-600">Pending orders</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Customers</h3>
                <p className="text-3xl font-bold text-purple-600">156</p>
                <p className="text-sm text-gray-600">Total customers</p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar currentPage={currentPage} onNavigate={handlePageChange} />
      <div className="flex-1">
        {renderContent()}
      </div>
    </div>
  );
};

export default EnhancedAdminDashboard;