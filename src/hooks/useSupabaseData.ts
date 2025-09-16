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
  }
) {
  const [data, setData] = useState<Tables[T]['Row'][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      let query = supabase.from(table).select('*');

      // Apply filters
      if (options?.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value);
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
      return insertedData;
    } catch (error) {
      console.error(`Error inserting into ${table}:`, error);
      throw error;
    }
  };

  const update = async (id: string, data: Tables[T]['Update']) => {
    try {
      const { data: updatedData, error } = await supabase
        .from(table)
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return updatedData;
    } catch (error) {
      console.error(`Error updating ${table}:`, error);
      throw error;
    }
  };

  const remove = async (id: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting from ${table}:`, error);
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
    refetch: fetchData
  };
}