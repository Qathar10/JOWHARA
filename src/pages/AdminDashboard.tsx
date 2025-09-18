import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Image, 
  ShoppingCart, 
  Users, 
  BarChart3, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Navigation,
  Award,
  CheckCircle,
  Clock,
  TrendingUp,
  DollarSign,
  AlertCircle,
  X,
  Loader,
  LogOut
} from 'lucide-react';
import { useSupabaseData } from '../hooks/useSupabaseData';
import ProductForm from '../components/admin/ProductForm';
import BannerForm from '../components/admin/BannerForm';
import BrandForm from '../components/admin/BrandForm';
import { signOut, isAdmin, type User } from '../lib/auth';
import type { Database } from '../lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];
type Category = Database['public']['Tables']['categories']['Row'];
type Brand = Database['public']['Tables']['brands']['Row'];
type Banner = Database['public']['Tables']['banners']['Row'];
type Order = Database['public']['Tables']['orders']['Row'];

interface AdminDashboardProps {
  user: User;
  onNavigate: (page: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onNavigate }) => {
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'navigation' | 'brands' | 'orders' | 'analytics'>('products');
  const [dataLoading, setDataLoading] = useState(true);

  // Check if user has admin access
  useEffect(() => {
    if (!isAdmin(user)) {
      // Redirect to login if not admin
      onNavigate('admin/login');
      return;
    }
  }, [user, onNavigate]);

  // Fetch data from Supabase
  const { data: products, loading: productsLoading, error: productsError } = useSupabaseData('products', { realtime: true });
  const { data: categories, loading: categoriesLoading, error: categoriesError } = useSupabaseData('categories', { realtime: true });
  const { data: brands, loading: brandsLoading, error: brandsError } = useSupabaseData('brands', { realtime: true });
  const { data: banners, loading: bannersLoading, error: bannersError } = useSupabaseData('banners', { realtime: true });
  const { data: orders, loading: ordersLoading, error: ordersError } = useSupabaseData('orders', { realtime: true });

  // Check if all data is loaded
  useEffect(() => {
    const allLoaded = !productsLoading && !categoriesLoading && !brandsLoading && !bannersLoading && !ordersLoading;
    setDataLoading(!allLoaded);
  }, [productsLoading, categoriesLoading, brandsLoading, bannersLoading, ordersLoading]);

  const handleLogout = () => {
    signOut().then(() => {
      onNavigate('home');
    }).catch(console.error);
  };

  // Redirect if not admin
  if (!isAdmin(user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
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

  // Show loading screen while data is being fetched
  if (dataLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-black border-t-transparent mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Admin Dashboard</h2>
          <p className="text-gray-600">Connecting to database...</p>
        </div>
      </div>
    );
  }

  // Show error if there's a connection issue
  if (productsError || categoriesError || brandsError || bannersError || ordersError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">
            Unable to connect to the database. Please check your Supabase configuration.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'products', name: 'Products', icon: <Package className="h-5 w-5" />, count: products.length },
    { id: 'banners', name: 'Banners', icon: <Image className="h-5 w-5" />, count: banners.length },
    { id: 'navigation', name: 'Navigation', icon: <Navigation className="h-5 w-5" />, count: 0 },
    { id: 'brands', name: 'Brands', icon: <Award className="h-5 w-5" />, count: brands.length },
    { id: 'orders', name: 'Orders', icon: <ShoppingCart className="h-5 w-5" />, count: orders.length },
    { id: 'analytics', name: 'Analytics', icon: <BarChart3 className="h-5 w-5" />, count: null }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center">
                <Settings className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold text-black">
                  Jowhara Admin
                </h1>
                <p className="text-xs text-gray-500 -mt-1">Management Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Welcome, {user.email}
              </div>
              <div className="text-sm text-gray-600">
                {products.length} Products • {orders.length} Orders
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors px-3 py-2 rounded-lg hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-xl shadow-sm p-2 sticky top-24">
              <div className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-black text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {tab.icon}
                      <span className="font-medium">{tab.name}</span>
                    </div>
                    {tab.count !== null && (
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        activeTab === tab.id ? 'bg-white text-black' : 'bg-gray-200 text-gray-600'
                      }`}>
                        {tab.count}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'products' && <ProductsTab products={products} categories={categories} />}
            {activeTab === 'banners' && <BannersTab banners={banners} />}
            {activeTab === 'navigation' && <NavigationTab />}
            {activeTab === 'brands' && <BrandsTab brands={brands} />}
            {activeTab === 'orders' && <OrdersTab orders={orders} />}
            {activeTab === 'analytics' && <AnalyticsTab products={products} orders={orders} categories={categories} />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Products Tab Component
const ProductsTab: React.FC<{ products: Product[]; categories: Category[] }> = ({ products, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const { insert, update, remove } = useSupabaseData('products');
  const categoryNames = categories.map(c => c.name);

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (data: Database['public']['Tables']['products']['Insert']) => {
    try {
      setActionLoading('saving');
      if (editingProduct) {
        await update(editingProduct.id, data);
      } else {
        await insert(data);
      }
      setShowForm(false);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error saving product. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        setActionLoading(id);
        await remove(id);
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingProduct(null);
  };

  const openAddForm = () => {
    setEditingProduct(null);
    setShowForm(true);
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Products</h2>
              <p className="text-gray-600 mt-1">Manage your product catalog</p>
            </div>
            <button 
              onClick={openAddForm}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Product</span>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categoryNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img 
                        src={product.images[0] || 'https://via.placeholder.com/48'} 
                        alt={product.name} 
                        className="h-12 w-12 rounded-lg object-cover" 
                      />
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {product.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    KSh {product.price.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stock > 10 ? 'bg-green-100 text-green-800' : 
                      product.stock > 0 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {product.featured ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Featured
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Regular
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        onClick={() => handleEdit(product)}
                        className="text-gray-400 hover:text-yellow-600 transition-colors"
                        disabled={actionLoading === product.id}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id, product.name)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        disabled={actionLoading === product.id}
                      >
                        {actionLoading === product.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Stats Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-900">{products.length}</div>
              <div className="text-sm text-gray-600">Total Products</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{products.filter(p => p.stock > 0).length}</div>
              <div className="text-sm text-gray-600">In Stock</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">{products.filter(p => p.stock === 0).length}</div>
              <div className="text-sm text-gray-600">Out of Stock</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">{products.filter(p => p.featured).length}</div>
              <div className="text-sm text-gray-600">Featured</div>
            </div>
          </div>
        </div>
      </div>
      
      {showForm && (
        <ProductForm
          product={editingProduct}
          categories={categoryNames}
          onSubmit={handleSubmit}
          onClose={closeForm}
          loading={actionLoading === 'saving'}
        />
      )}
    </>
  );
};

// Banners Tab Component
const BannersTab: React.FC<{ banners: Banner[] }> = ({ banners }) => {
  const { insert, update, remove } = useSupabaseData('banners');
  const { data: categories } = useSupabaseData('categories');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

  const categoryNames = categories.map(c => c.name);

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner);
    setShowForm(true);
  };

  const handleSubmit = async (data: Database['public']['Tables']['banners']['Insert']) => {
    try {
      setActionLoading('saving');
      if (editingBanner) {
        await update(editingBanner.id, data);
      } else {
        await insert(data);
      }
      setShowForm(false);
      setEditingBanner(null);
    } catch (error) {
      console.error('Error saving banner:', error);
      alert('Error saving banner. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBanner(null);
  };

  const openAddForm = () => {
    setEditingBanner(null);
    setShowForm(true);
  };

  const toggleBannerStatus = async (banner: Banner) => {
    try {
      setActionLoading(banner.id);
      await update(banner.id, { active: !banner.active });
    } catch (error) {
      console.error('Error updating banner:', error);
      alert('Error updating banner status.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBanner = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      try {
        setActionLoading(id);
        await remove(id);
      } catch (error) {
        console.error('Error deleting banner:', error);
        alert('Error deleting banner.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Banner Management</h2>
              <p className="text-gray-600 mt-1">Control homepage banners and promotions</p>
            </div>
            <button 
              onClick={openAddForm}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Banner</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {banners.map((banner) => (
              <div key={banner.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-video relative">
                  <img src={banner.image} alt={banner.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleBannerStatus(banner)}
                      disabled={actionLoading === banner.id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        banner.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {actionLoading === banner.id ? (
                        <Loader className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      {banner.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{banner.title}</h3>
                  <p className="text-sm text-gray-600 mb-3">{banner.subtitle}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {banner.category || 'General'}
                    </span>
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => handleEdit(banner)}
                        className="text-gray-400 hover:text-yellow-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => deleteBanner(banner.id, banner.title)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                        disabled={actionLoading === banner.id}
                      >
                        {actionLoading === banner.id ? (
                          <Loader className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {showForm && (
        <BannerForm
          banner={editingBanner}
          categories={categoryNames}
          onSubmit={handleSubmit}
          onClose={closeForm}
          loading={actionLoading === 'saving'}
        />
      )}
    </>
  );
};

// Navigation Tab Component  
const NavigationTab: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Navigation Settings</h2>
            <p className="text-gray-600 mt-1">Configure dropdown menus and navigation items</p>
          </div>
          <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>Add Navigation Item</span>
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="text-center py-12">
          <Navigation className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Navigation management coming soon...</p>
        </div>
      </div>
    </div>
  );
};

// Brands Tab Component
const BrandsTab: React.FC<{ brands: Brand[] }> = ({ brands }) => {
  const { update, remove } = useSupabaseData('brands');
  const { insert } = useSupabaseData('brands');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const handleEdit = (brand: Brand) => {
    setEditingBrand(brand);
    setShowForm(true);
  };

  const handleSubmit = async (data: Database['public']['Tables']['brands']['Insert']) => {
    try {
      setActionLoading('saving');
      if (editingBrand) {
        await update(editingBrand.id, data);
      } else {
        await insert(data);
      }
      setShowForm(false);
      setEditingBrand(null);
    } catch (error) {
      console.error('Error saving brand:', error);
      alert('Error saving brand. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBrand(null);
  };

  const openAddForm = () => {
    setEditingBrand(null);
    setShowForm(true);
  };

  const toggleBrandStatus = async (brand: Brand) => {
    try {
      setActionLoading(brand.id);
      await update(brand.id, { active: !brand.active });
    } catch (error) {
      console.error('Error updating brand:', error);
      alert('Error updating brand status.');
    } finally {
      setActionLoading(null);
    }
  };

  const deleteBrand = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"?`)) {
      try {
        setActionLoading(id);
        await remove(id);
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Error deleting brand.');
      } finally {
        setActionLoading(null);
      }
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Brand Management</h2>
              <p className="text-gray-600 mt-1">Manage brand listings and information</p>
            </div>
            <button 
              onClick={openAddForm}
              className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Add Brand</span>
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {brands.map((brand) => (
              <div key={brand.id} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="aspect-square relative">
                  <img src={brand.image || 'https://via.placeholder.com/200'} alt={brand.name} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => toggleBrandStatus(brand)}
                      disabled={actionLoading === brand.id}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                        brand.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-red-100 text-red-800 hover:bg-red-200'
                      }`}
                    >
                      {actionLoading === brand.id ? (
                        <Loader className="h-3 w-3 animate-spin mr-1" />
                      ) : null}
                      {brand.active ? 'Active' : 'Inactive'}
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-1">{brand.name}</h3>
                  <p className="text-sm text-gray-600 mb-3">{brand.description}</p>
                  <div className="flex items-center justify-end space-x-2">
                    <button 
                      onClick={() => handleEdit(brand)}
                      className="text-gray-400 hover:text-yellow-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => deleteBrand(brand.id, brand.name)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                      disabled={actionLoading === brand.id}
                    >
                      {actionLoading === brand.id ? (
                        <Loader className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {showForm && (
        <BrandForm
          brand={editingBrand}
          onSubmit={handleSubmit}
          onClose={closeForm}
          loading={actionLoading === 'saving'}
        />
      )}
    </>
  );
};

// Orders Tab Component
const OrdersTab: React.FC<{ orders: Order[] }> = ({ orders }) => {
  const { update } = useSupabaseData('orders');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      setActionLoading(orderId);
      await update(orderId, { status: newStatus });
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Error updating order status.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
            <p className="text-gray-600 mt-1">Track and manage customer orders</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Total: KSh {orders.reduce((sum, order) => sum + order.total, 0).toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  #{order.id.slice(-8)}
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{order.customer_name}</div>
                  <div className="text-sm text-gray-500">{order.customer_phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">
                    {Array.isArray(order.items) ? order.items.length : 0} item(s)
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">
                  KSh {order.total.toLocaleString()}
                </td>
                <td className="px-6 py-4">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    disabled={actionLoading === order.id}
                    className={`text-xs px-2 py-1 rounded border ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Stats */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-gray-900">{orders.length}</div>
            <div className="text-sm text-gray-600">Total Orders</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-yellow-600">{orders.filter(o => o.status === 'pending').length}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{orders.filter(o => o.status === 'confirmed').length}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{orders.filter(o => o.status === 'delivered').length}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Analytics Tab Component
const AnalyticsTab: React.FC<{ products: Product[]; orders: Order[]; categories: Category[] }> = ({ products, orders, categories }) => {
  const analyticsData = {
    totalRevenue: orders.reduce((sum, order) => sum + order.total, 0),
    totalOrders: orders.length,
    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
    topSellingCategory: categories.length > 0 ? categories[0].name : 'N/A',
    revenueGrowth: 15.3,
    orderGrowth: 8.7,
    customerRetention: 73.2
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">KSh {analyticsData.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600">+{analyticsData.revenueGrowth}%</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{analyticsData.totalOrders}</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="h-4 w-4 text-blue-500 mr-1" />
                <span className="text-sm text-blue-600">+{analyticsData.orderGrowth}%</span>
              </div>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <ShoppingCart className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg. Order Value</p>
              <p className="text-2xl font-bold text-gray-900">KSh {Math.round(analyticsData.averageOrderValue).toLocaleString()}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">Per order</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <BarChart3 className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{products.length}</p>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-500">In catalog</span>
              </div>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <Package className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Products by Category</h3>
          <div className="space-y-4">
            {categories.map((category, index) => {
              const categoryProducts = products.filter(p => p.category === category.name);
              const percentage = products.length > 0 ? (categoryProducts.length / products.length) * 100 : 0;
              return (
                <div key={category.id}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-500">{categoryProducts.length} products</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        index % 6 === 0 ? 'bg-blue-500' :
                        index % 6 === 1 ? 'bg-green-500' :
                        index % 6 === 2 ? 'bg-yellow-500' :
                        index % 6 === 3 ? 'bg-red-500' :
                        index % 6 === 4 ? 'bg-purple-500' : 'bg-pink-500'
                      }`}
                      style={{ width: `${Math.max(percentage, 5)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
          <div className="space-y-4">
            {orders.slice(0, 5).map((order, index) => (
              <div key={order.id} className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">New order from {order.customer_name}</p>
                  <p className="text-xs text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;