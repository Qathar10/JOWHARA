import { useState } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/supabase';

type Tables = Database['public']['Tables'];

export function useSupabaseOperations<T extends keyof Tables>(tableName: T) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOperation = async <R>(operation: () => Promise<R>): Promise<R | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const fetchAll = async () => {
    return handleOperation(async () => {
      const { data, error } = await supabase.from(tableName).select('*');
      if (error) throw error;
      return data;
    });
  };

  const fetchById = async (id: string) => {
    return handleOperation(async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data;
    });
  };

  const create = async (data: Tables[T]['Insert']) => {
    return handleOperation(async () => {
      const { data: result, error } = await supabase
        .from(tableName)
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return result;
    });
  };

  const update = async (id: string, data: Tables[T]['Update']) => {
    return handleOperation(async () => {
      const { data: result, error } = await supabase
        .from(tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return result;
    });
  };

  const remove = async (id: string) => {
    return handleOperation(async () => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
      if (error) throw error;
      return true;
    });
  };

  return {
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    update,
    remove,
    clearError: () => setError(null)
  };
}