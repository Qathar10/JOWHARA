import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection function
export const testConnection = async () => {
  try {
    const { data, error } = await supabase.from('categories').select('count').limit(1);
    return { success: !error, error: error?.message };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
};

// Enhanced Database types matching your schema
export interface Database {
  public: {
    Tables: {
      admin_users: {
        Row: {
          id: string;
          email: string;
          password_hash: string;
          full_name: string;
          role: 'super_admin' | 'admin' | 'moderator';
          active: boolean;
          last_login: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          password_hash: string;
          full_name: string;
          role?: 'super_admin' | 'admin' | 'moderator';
          active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          password_hash?: string;
          full_name?: string;
          role?: 'super_admin' | 'admin' | 'moderator';
          active?: boolean;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          icon: string | null;
          sort_order: number;
          active: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          icon?: string | null;
          sort_order?: number;
          active?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          icon?: string | null;
          sort_order?: number;
          active?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      brands: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          image: string | null;
          logo: string | null;
          website: string | null;
          country: string | null;
          sort_order: number;
          active: boolean;
          featured: boolean;
          meta_title: string | null;
          meta_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          logo?: string | null;
          website?: string | null;
          country?: string | null;
          sort_order?: number;
          active?: boolean;
          featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          description?: string | null;
          image?: string | null;
          logo?: string | null;
          website?: string | null;
          country?: string | null;
          sort_order?: number;
          active?: boolean;
          featured?: boolean;
          meta_title?: string | null;
          meta_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          name: string;
          slug: string;
          sku: string | null;
          category_id: string | null;
          brand_id: string | null;
          price: number;
          compare_price: number | null;
          cost_price: number | null;
          description: string | null;
          short_description: string | null;
          ingredients: string | null;
          usage_instructions: string | null;
          benefits: string | null;
          images: string[];
          stock: number;
          min_stock: number;
          max_stock: number;
          weight: number | null;
          dimensions: any | null;
          featured: boolean;
          active: boolean;
          tags: string[] | null;
          meta_title: string | null;
          meta_description: string | null;
          seo_keywords: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug?: string;
          sku?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          price: number;
          compare_price?: number | null;
          cost_price?: number | null;
          description?: string | null;
          short_description?: string | null;
          ingredients?: string | null;
          usage_instructions?: string | null;
          benefits?: string | null;
          images?: string[];
          stock?: number;
          min_stock?: number;
          max_stock?: number;
          weight?: number | null;
          dimensions?: any | null;
          featured?: boolean;
          active?: boolean;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          seo_keywords?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          slug?: string;
          sku?: string | null;
          category_id?: string | null;
          brand_id?: string | null;
          price?: number;
          compare_price?: number | null;
          cost_price?: number | null;
          description?: string | null;
          short_description?: string | null;
          ingredients?: string | null;
          usage_instructions?: string | null;
          benefits?: string | null;
          images?: string[];
          stock?: number;
          min_stock?: number;
          max_stock?: number;
          weight?: number | null;
          dimensions?: any | null;
          featured?: boolean;
          active?: boolean;
          tags?: string[] | null;
          meta_title?: string | null;
          meta_description?: string | null;
          seo_keywords?: string[] | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          full_name: string;
          email: string | null;
          phone: string;
          whatsapp_number: string | null;
          address: any | null;
          date_of_birth: string | null;
          gender: 'male' | 'female' | 'other' | null;
          preferences: any;
          total_orders: number;
          total_spent: number;
          last_order_date: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          full_name: string;
          email?: string | null;
          phone: string;
          whatsapp_number?: string | null;
          address?: any | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          preferences?: any;
          total_orders?: number;
          total_spent?: number;
          last_order_date?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string;
          whatsapp_number?: string | null;
          address?: any | null;
          date_of_birth?: string | null;
          gender?: 'male' | 'female' | 'other' | null;
          preferences?: any;
          total_orders?: number;
          total_spent?: number;
          last_order_date?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string | null;
          shipping_address: any | null;
          billing_address: any | null;
          items: any[];
          subtotal: number;
          tax_amount: number;
          shipping_cost: number;
          discount_amount: number;
          total: number;
          currency: string;
          status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method: string | null;
          notes: string | null;
          admin_notes: string | null;
          shipped_at: string | null;
          delivered_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email?: string | null;
          shipping_address?: any | null;
          billing_address?: any | null;
          items?: any[];
          subtotal?: number;
          tax_amount?: number;
          shipping_cost?: number;
          discount_amount?: number;
          total: number;
          currency?: string;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          order_number?: string;
          customer_id?: string | null;
          customer_name?: string;
          customer_phone?: string;
          customer_email?: string | null;
          shipping_address?: any | null;
          billing_address?: any | null;
          items?: any[];
          subtotal?: number;
          tax_amount?: number;
          shipping_cost?: number;
          discount_amount?: number;
          total?: number;
          currency?: string;
          status?: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
          payment_status?: 'pending' | 'paid' | 'failed' | 'refunded';
          payment_method?: string | null;
          notes?: string | null;
          admin_notes?: string | null;
          shipped_at?: string | null;
          delivered_at?: string | null;
          cancelled_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      banners: {
        Row: {
          id: string;
          title: string;
          subtitle: string | null;
          description: string | null;
          image: string;
          mobile_image: string | null;
          link_url: string | null;
          link_text: string | null;
          category_id: string | null;
          position: 'hero' | 'secondary' | 'sidebar';
          sort_order: number;
          active: boolean;
          start_date: string | null;
          end_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          subtitle?: string | null;
          description?: string | null;
          image: string;
          mobile_image?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          category_id?: string | null;
          position?: 'hero' | 'secondary' | 'sidebar';
          sort_order?: number;
          active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          subtitle?: string | null;
          description?: string | null;
          image?: string;
          mobile_image?: string | null;
          link_url?: string | null;
          link_text?: string | null;
          category_id?: string | null;
          position?: 'hero' | 'secondary' | 'sidebar';
          sort_order?: number;
          active?: boolean;
          start_date?: string | null;
          end_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      inventory_logs: {
        Row: {
          id: string;
          product_id: string | null;
          type: 'adjustment' | 'sale' | 'return' | 'damage' | 'restock';
          quantity_change: number;
          previous_stock: number;
          new_stock: number;
          reason: string | null;
          reference_id: string | null;
          admin_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id?: string | null;
          type: 'adjustment' | 'sale' | 'return' | 'damage' | 'restock';
          quantity_change: number;
          previous_stock: number;
          new_stock: number;
          reason?: string | null;
          reference_id?: string | null;
          admin_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string | null;
          type?: 'adjustment' | 'sale' | 'return' | 'damage' | 'restock';
          quantity_change?: number;
          previous_stock?: number;
          new_stock?: number;
          reason?: string | null;
          reference_id?: string | null;
          admin_id?: string | null;
          created_at?: string;
        };
      };
      admin_activity_logs: {
        Row: {
          id: string;
          admin_id: string | null;
          action: string;
          table_name: string | null;
          record_id: string | null;
          old_values: any | null;
          new_values: any | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          admin_id?: string | null;
          action: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          admin_id?: string | null;
          action?: string;
          table_name?: string | null;
          record_id?: string | null;
          old_values?: any | null;
          new_values?: any | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
      };
    };
  };
}