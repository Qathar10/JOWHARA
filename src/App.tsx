import { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductPage from './pages/ProductPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import { useProducts, useCategories, useBrands } from './data/supabaseData';
import { getCurrentUser, onAuthStateChange, type User } from './lib/auth';
import type { Database } from './lib/supabase';

type Product = Database['public']['Tables']['products']['Row'];

function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Fetch data from Supabase
  const { data: products, loading: productsLoading } = useProducts();
  const { data: categories, loading: categoriesLoading } = useCategories();
  const { data: brands, loading: brandsLoading } = useBrands();
  
  const loading = productsLoading || categoriesLoading || brandsLoading;

  useEffect(() => {
    // Check current user on mount
    getCurrentUser().then(user => {
      setUser(user);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((user) => {
      setUser(user);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    setSelectedProduct(null);
  };

  const handleViewProduct = (product: Product) => {
    setSelectedProduct(product);
    setCurrentPage('product');
  };

  const handleBackFromProduct = () => {
    setSelectedProduct(null);
    setCurrentPage('shop');
  };

  // Handle admin routes
  if (currentPage === 'admin' || currentPage === 'admin/login') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!user) {
      return <AdminLogin onNavigate={handleNavigate} />;
    }

    return <AdminDashboard user={user} onNavigate={handleNavigate} />;
  }
  
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-black border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        currentPage={currentPage} 
        onNavigate={handleNavigate}
        categories={categories}
        brands={brands}
      />
      
      <main>
        {currentPage === 'home' && (
          <HomePage 
            onNavigate={handleNavigate} 
            onViewProduct={handleViewProduct}
            products={products}
            categories={categories}
          />
        )}
        {currentPage === 'shop' && (
          <ShopPage 
            onViewProduct={handleViewProduct}
            products={products}
            categories={categories}
          />
        )}
        {currentPage === 'product' && selectedProduct && (
          <ProductPage 
            product={selectedProduct} 
            onBack={handleBackFromProduct}
            onViewProduct={handleViewProduct}
            products={products}
          />
        )}
        {currentPage === 'about' && <AboutPage />}
        {currentPage === 'contact' && <ContactPage />}
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
