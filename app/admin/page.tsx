"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { getCurrentUser } from "../../utils/auth";

interface UsageSummary {
  period: string;
  summary: {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    successRate: string;
    estimatedCost: string;
    avgCostPerRequest: string;
  };
  breakdown: {
    byEndpoint: Record<string, number>;
    byUser: Record<string, number>;
    byDay: Record<string, number>;
  };
  alerts: {
    highUsage: boolean;
    highCost: boolean;
    highFailureRate: boolean;
  };
}

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [days, setDays] = useState(7);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = await getCurrentUser();
      if (!currentUser || currentUser.username !== 'unoform_admin') {
        router.push('/login');
      } else {
        setUser(currentUser);
        fetchUsageData();
      }
    };
    checkAuth();
  }, [router, days]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('auth-token='))
        ?.split('=')[1];

      const response = await fetch(`/api/admin/usage?days=${days}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch usage data');
      }

      const data = await response.json();
      setUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load usage data');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex max-w-7xl mx-auto flex-col items-center justify-center min-h-screen bg-background">
      <Header />
      <main className="flex flex-1 w-full flex-col items-center justify-center text-center px-4 mt-20">
        <h1 className="mx-auto max-w-4xl font-display text-5xl font-bold tracking-tight text-foreground sm:text-6xl mb-10">
          Admin <span className="gradient-text">Dashboard</span>
        </h1>

        {loading ? (
          <div className="text-muted-foreground">Loading usage data...</div>
        ) : error ? (
          <div className="text-destructive">{error}</div>
        ) : usage ? (
          <div className="w-full max-w-6xl space-y-8">
            {/* Period Selector */}
            <div className="flex justify-center gap-2">
              {[7, 14, 30].map((d) => (
                <button
                  key={d}
                  onClick={() => setDays(d)}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    days === d 
                      ? 'bg-[#C19A5B] text-white' 
                      : 'bg-surface border border-border hover:bg-muted'
                  }`}
                >
                  {d} Days
                </button>
              ))}
            </div>

            {/* Alerts */}
            {(usage.alerts.highUsage || usage.alerts.highCost || usage.alerts.highFailureRate) && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                <h3 className="font-semibold text-destructive mb-2">Alerts</h3>
                <ul className="space-y-1 text-sm">
                  {usage.alerts.highUsage && <li>⚠️ High usage detected</li>}
                  {usage.alerts.highCost && <li>⚠️ High cost detected</li>}
                  {usage.alerts.highFailureRate && <li>⚠️ High failure rate detected</li>}
                </ul>
              </div>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Total Requests</h3>
                </div>
                <div className="card-content">
                  <p className="text-3xl font-bold text-[#C19A5B]">{usage.summary.totalRequests}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {usage.summary.successRate} success rate
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Estimated Cost</h3>
                </div>
                <div className="card-content">
                  <p className="text-3xl font-bold text-[#C19A5B]">{usage.summary.estimatedCost}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {usage.summary.avgCostPerRequest} per request
                  </p>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3 className="card-title">Success/Failure</h3>
                </div>
                <div className="card-content">
                  <p className="text-lg">
                    <span className="text-green-600">{usage.summary.successfulRequests}</span>
                    {' / '}
                    <span className="text-destructive">{usage.summary.failedRequests}</span>
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Success / Failed
                  </p>
                </div>
              </div>
            </div>

            {/* Usage by Endpoint */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Usage by Endpoint</h3>
              </div>
              <div className="card-content">
                <div className="space-y-2">
                  {Object.entries(usage.breakdown.byEndpoint).map(([endpoint, count]) => (
                    <div key={endpoint} className="flex justify-between">
                      <span className="capitalize">{endpoint}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Usage by User */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Usage by User</h3>
              </div>
              <div className="card-content">
                <div className="space-y-2">
                  {Object.entries(usage.breakdown.byUser).map(([user, count]) => (
                    <div key={user} className="flex justify-between">
                      <span>{user}</span>
                      <span className="font-mono">{count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Daily Usage Chart */}
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">Daily Usage</h3>
              </div>
              <div className="card-content">
                <div className="space-y-2">
                  {Object.entries(usage.breakdown.byDay)
                    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                    .map(([day, count]) => (
                      <div key={day} className="flex justify-between">
                        <span>{formatDate(day)}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-muted rounded-full h-2">
                            <div 
                              className="bg-[#C19A5B] h-2 rounded-full"
                              style={{ 
                                width: `${Math.min((count / Math.max(...Object.values(usage.breakdown.byDay))) * 100, 100)}%` 
                              }}
                            />
                          </div>
                          <span className="font-mono text-sm w-10 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <Footer />
    </div>
  );
}