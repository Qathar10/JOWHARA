import { useSupabaseData, useProductsWithRelations, useOrdersWithCustomers, useBannersWithCategories } from '../hooks/useSupabaseData';

// Enhanced data fetching hooks for the main application
export const useCategories = () => useSupabaseData('categories', { 
  realtime: true,
  filter: { active: true },
  orderBy: { column: 'sort_order', ascending: true }
});

export const useProducts = () => useProductsWithRelations();

export const useBrands = () => useSupabaseData('brands', { 
  realtime: true,
  filter: { active: true },
  orderBy: { column: 'sort_order', ascending: true }
});

export const useBanners = () => useBannersWithCategories();

export const useOrders = () => useOrdersWithCustomers();

export const useCustomers = () => useSupabaseData('customers', { 
  realtime: true,
  orderBy: { column: 'created_at', ascending: false }
});

export const useInventoryLogs = () => useSupabaseData('inventory_logs', {
  realtime: true,
  joins: ['products!inventory_logs_product_id_fkey(name, sku)'],
  orderBy: { column: 'created_at', ascending: false }
});

export const useAdminActivityLogs = () => useSupabaseData('admin_activity_logs', {
  realtime: true,
  joins: ['admin_users!admin_activity_logs_admin_id_fkey(full_name, email)'],
  orderBy: { column: 'created_at', ascending: false }
});

// Admin-specific hooks
export const useAdminUsers = () => useSupabaseData('admin_users', {
  realtime: true,
  orderBy: { column: 'created_at', ascending: false }
});

// Featured products hook
export const useFeaturedProducts = () => useSupabaseData('products', {
  realtime: true,
  filter: { featured: true, active: true },
  joins: [
    'categories!products_category_id_fkey(name, slug)',
    'brands!products_brand_id_fkey(name, slug)'
  ]
});

// Low stock products hook
export const useLowStockProducts = () => useSupabaseData('products', {
  realtime: true,
  filter: { active: true },
  // Note: You might need to implement a custom query for stock <= min_stock comparison
});

// Recent orders hook
export const useRecentOrders = (limit: number = 10) => useSupabaseData('orders', {
  realtime: true,
  orderBy: { column: 'created_at', ascending: false }
});