import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RefreshCw, Database, Globe, Key, Table } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface TestResult {
  name: string;
  status: 'loading' | 'success' | 'error';
  message: string;
  icon: React.ReactNode;
}

const ConnectionTest: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([
    {
      name: 'Environment Variables',
      status: 'loading',
      message: 'Checking environment configuration...',
      icon: <Globe className="h-5 w-5" />
    },
    {
      name: 'Database Connection',
      status: 'loading',
      message: 'Testing database connectivity...',
      icon: <Database className="h-5 w-5" />
    },
    {
      name: 'Authentication',
      status: 'loading',
      message: 'Verifying auth configuration...',
      icon: <Key className="h-5 w-5" />
    },
    {
      name: 'Table Access',
      status: 'loading',
      message: 'Testing table permissions...',
      icon: <Table className="h-5 w-5" />
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    const newTests = [...tests];

    // Test 1: Environment Variables
    try {
      const url = import.meta.env.VITE_SUPABASE_URL;
      const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
      
      if (url && key) {
        newTests[0] = {
          ...newTests[0],
          status: 'success',
          message: `URL: ${url.substring(0, 30)}... | Key: ${key.substring(0, 20)}...`
        };
      } else {
        newTests[0] = {
          ...newTests[0],
          status: 'error',
          message: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY'
        };
      }
    } catch (error) {
      newTests[0] = {
        ...newTests[0],
        status: 'error',
        message: 'Failed to read environment variables'
      };
    }
    setTests([...newTests]);

    // Test 2: Database Connection
    try {
      const { data, error } = await supabase.from('categories').select('count').limit(1);
      if (error) throw error;
      
      newTests[1] = {
        ...newTests[1],
        status: 'success',
        message: 'Successfully connected to Supabase database'
      };
    } catch (error) {
      newTests[1] = {
        ...newTests[1],
        status: 'error',
        message: `Connection failed: ${(error as Error).message}`
      };
    }
    setTests([...newTests]);

    // Test 3: Authentication
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      newTests[2] = {
        ...newTests[2],
        status: 'success',
        message: user ? `Authenticated as: ${user.email}` : 'Auth service available (not logged in)'
      };
    } catch (error) {
      newTests[2] = {
        ...newTests[2],
        status: 'error',
        message: `Auth test failed: ${(error as Error).message}`
      };
    }
    setTests([...newTests]);

    // Test 4: Table Access
    try {
      const tables = ['categories', 'brands', 'products', 'customers', 'orders'];
      const results = await Promise.allSettled(
        tables.map(table => supabase.from(table).select('count').limit(1))
      );
      
      const accessible = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      if (accessible === tables.length) {
        newTests[3] = {
          ...newTests[3],
          status: 'success',
          message: `All ${tables.length} tables accessible`
        };
      } else {
        newTests[3] = {
          ...newTests[3],
          status: 'error',
          message: `${accessible}/${tables.length} tables accessible, ${failed} failed`
        };
      }
    } catch (error) {
      newTests[3] = {
        ...newTests[3],
        status: 'error',
        message: `Table access test failed: ${(error as Error).message}`
      };
    }
    setTests([...newTests]);
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return <RefreshCw className="h-6 w-6 text-blue-500 animate-spin" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Supabase Connection Test</h1>
                <p className="text-gray-600 mt-1">Verify your Supabase configuration and connectivity</p>
              </div>
              <button
                onClick={runTests}
                disabled={isRunning}
                className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center space-x-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
                <span>Run Tests</span>
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {tests.map((test, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 transition-all duration-200 ${getStatusColor(test.status)}`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getStatusIcon(test.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        {test.icon}
                        <h3 className="font-semibold text-gray-900">{test.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{test.message}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="mt-8 p-4 bg-gray-100 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Test Summary</h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {tests.filter(t => t.status === 'success').length}
                  </div>
                  <div className="text-sm text-gray-600">Passed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {tests.filter(t => t.status === 'error').length}
                  </div>
                  <div className="text-sm text-gray-600">Failed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {tests.filter(t => t.status === 'loading').length}
                  </div>
                  <div className="text-sm text-gray-600">Running</div>
                </div>
              </div>
            </div>

            {/* Environment Info */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Environment Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Node Environment:</strong> {import.meta.env.MODE}</p>
                <p><strong>Vite Version:</strong> {import.meta.env.VITE_APP_VERSION || 'Unknown'}</p>
                <p><strong>Supabase URL:</strong> {import.meta.env.VITE_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
                <p><strong>Supabase Key:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionTest;