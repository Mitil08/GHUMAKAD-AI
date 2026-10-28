/**
 * Ghumakad AI - Frontend API Service
 * Centralized API client for communicating with the Flask backend.
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

/**
 * Checks backend and AI system readiness.
 */
export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, {
      headers: { Accept: 'application/json' },
    });
    if (!res.ok) {
      throw new Error(`Health check returned status ${res.status}`);
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend health check error:', err);
    return {
      status: 'offline',
      components: { api: { status: 'offline' } },
      ai_ready: false,
    };
  }
}

/**
 * Fetches destinations with optional query filters.
 */
export async function fetchDestinations(filters = {}) {
  const query = new URLSearchParams();
  if (filters.state) query.append('state', filters.state);
  if (filters.type) query.append('type', filters.type);
  if (filters.search) query.append('search', filters.search);

  const url = `${API_BASE_URL}/destinations${query.toString() ? `?${query.toString()}` : ''}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to load destinations: ${res.statusText}`);
  }
  return await res.json();
}

/**
 * Fetches a single destination by identifier.
 */
export async function fetchDestinationById(destinationId) {
  const res = await fetch(`${API_BASE_URL}/destinations/${destinationId}`);
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `Destination not found (${res.status})`);
  }
  return await res.json();
}

/**
 * Submits user travel criteria and fetches AI-grounded recommendations & itineraries.
 */
export async function fetchRecommendations(criteria) {
  const res = await fetch(`${API_BASE_URL}/recommendations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(criteria),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      data.message || (data.details && data.details.join(', ')) || 'Failed to generate recommendations.';
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}
