import { useSupabaseData } from '../hooks/useSupabaseData';

// This file provides data fetching hooks for the main application
export const useCategories = () => useSupabaseData('categories', { realtime: true });
export const useProducts = () => useSupabaseData('products', { realtime: true });
export const useBrands = () => useSupabaseData('brands', { realtime: true });
export const useBanners = () => useSupabaseData('banners', { realtime: true });
export const useOrders = () => useSupabaseData('orders', { realtime: true });