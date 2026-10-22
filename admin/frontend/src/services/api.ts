/**
 * Central Backend API Client for ManPowerLink Admin Frontend
 * Connects to Node.js/Express REST server at /api/v1
 */

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || '/api/v1';

export interface BackendHealthResponse {
  status: string;
  service: string;
  version: string;
  timestamp: string;
}

export const adminApiClient = {
  /**
   * Check connection health with the Central Backend
   */
  async checkHealth(): Promise<{ online: boolean; data?: BackendHealthResponse; error?: string }> {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, {
        headers: { 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      return { online: true, data };
    } catch (err: any) {
      return { online: false, error: err.message || 'Central backend unreachable' };
    }
  },

  /**
   * Fetch live dashboard metrics from the Central Backend
   */
  async getDashboardMetrics() {
    try {
      const res = await fetch(`${API_BASE_URL}/dashboard/metrics`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend metrics fetch failed, fallback to local store:', err);
      return null;
    }
  },

  /**
   * Fetch service categories from backend
   */
  async getCategories() {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend categories fetch failed:', err);
      return null;
    }
  },

  /**
   * Fetch workers list from backend
   */
  async getWorkers() {
    try {
      const res = await fetch(`${API_BASE_URL}/workers`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn('Backend workers fetch failed:', err);
      return null;
    }
  },
};
