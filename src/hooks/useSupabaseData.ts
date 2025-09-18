import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

export function useSupabaseData<T extends keyof Tables>(
  table: T,
  options?: {
    filter?: Record<string, any>;
    orderBy?: { column: string; ascending?: boolean };
    realtime?: boolean;
    select?: string;
    joins?: string[];
  }
) {
  const [data, setData] = useState<Tables[T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      let selectClause = options?.select || '*';
      
      // Add joins if specified
      if (options?.joins && options.joins.length > 0) {
        const joinClauses = options.joins.join(', ');
        selectClause = `*, ${joinClauses}`;
      }

      let query = supabase.from(table).select(selectClause);

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          if (Array.isArray(value)) {
            query = query.in(key, value);
          } else if (value !== null && value !== undefined) {
            query = query.eq(key, value);
          }
        });
      }

      // Apply ordering
      if (options?.orderBy) {
        query = query.order(options.orderBy.column, { 
          ascending: options.orderBy.ascending ?? true 
        });
      }

      const { data: fetchedData, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setData(fetchedData || []);
      setError(null);
    } catch (err) {
      console.error(`Error fetching ${table}:`, err);
      setError(err instanceof Error ? err.message : 'Database connection error');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [table, JSON.stringify(options)]);

  useEffect(() => {
    let subscription: any;

    fetchData();

    // Set up real-time subscription if enabled
    if (options?.realtime) {
      subscription = supabase
        .channel(`${table}_changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
          },
          (payload) => {
            console.log(`Real-time update for ${table}:`, payload);
            // Refetch data on any change
            fetchData();
          }
        )
        .subscribe();
    }

    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fetchData, table, options?.realtime]);

  const insert = async (data: Tables[T]['Insert']) => {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(data)
        .select()
        .single();

      if (error) throw error;
      
      // Log admin activity
      await logAdminActivity('INSERT', table, insertedData.id, null, insertedData);
      
      return insertedData;
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  };

  const update = async (id: string, data: Tables[T]['Update']) => {
    try {
      // Get old values for logging
      const { data: oldData } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      // Log admin activity
      await logAdminActivity('UPDATE', table, id, oldData, updatedData);
      
      return updatedData;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      // Get old values for logging
      const { data: oldData } = await supabase
        .from(table)
        .select('*')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Log admin activity
      await logAdminActivity('DELETE', table, id, oldData, null);
      
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
      throw error;
    }
  };

  const bulkInsert = async (dataArray: Tables[T]['Insert'][]) => {
    try {
      const { data: insertedData, error } = await supabase
        .from(table)
        .insert(dataArray)
        .select();

      if (error) throw error;
      
      // Log admin activity for bulk insert
      await logAdminActivity('BULK_INSERT', table, null, null, { count: dataArray.length });
      
      return insertedData;
    } catch (error) {
      console.error(`Error bulk inserting into ${table}:`, error);
      throw error;
    }
  };

  const bulkUpdate = async (updates: { id: string; data: Tables[T]['Update'] }[]) => {
    try {
      const promises = updates.map(({ id, data }) => update(id, data));
      const results = await Promise.all(promises);
      return results;
    } catch (error) {
      console.error(`Error bulk updating ${table}:`, error);
      throw error;
    }
  };

  return {
    data,
    loading,
    error,
    insert,
    update,
    remove,
    bulkInsert,
    bulkUpdate,
    refetch: fetchData
  };
}

// Helper function to log admin activities
const logAdminActivity = async (
  action: string,
  tableName: string,
  recordId: string | null,
  oldValues: any,
  newValues: any
) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || user.app_metadata?.role !== 'admin') return;

    await supabase.from('admin_activity_logs').insert({
      user_id: user.id,
      user_email: user.email,
      action,
      table_name: tableName,
      record_id: recordId,
      old_values: oldValues,
      new_values: newValues,
      ip_address: null, // You can implement IP detection if needed
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
};

// Enhanced hooks for specific tables with joins
export const useProductsWithRelations = () => {
  return useSupabaseData('products', {
    realtime: true,
    joins: [
      'categories!products_category_id_fkey(name, slug)',
      'brands!products_brand_id_fkey(name, slug)'
    ]
  });
};

export const useOrdersWithCustomers = () => {
  return useSupabaseData('orders', {
    realtime: true,
    joins: ['customers!orders_customer_id_fkey(full_name, email, phone)'],
    orderBy: { column: 'created_at', ascending: false }
  });
};

export const useBannersWithCategories = () => {
  return useSupabaseData('banners', {
    realtime: true,
    joins: ['categories!banners_category_id_fkey(name, slug)'],
    orderBy: { column: 'sort_order', ascending: true }
  });
};