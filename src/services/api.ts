/**
 * Client API service for secure authentication and counselling persistence
 */

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  hallTicket: string;
  rank: number;
  category: string;
  gender: string;
  mobile: string;
}

export interface RegisterPayload {
  fullName: string;
  hallTicket: string;
  rank: number | string;
  category: string;
  gender: string;
  mobile: string;
  password: string;
  confirmPassword: string;
}

const TOKEN_KEY = 'tg_eapcet_session_token';
const COUNSELLING_CACHE_KEY = 'tg_eapcet_counselling_cache';

export const authStorage = {
  getToken: (): string | null => {
    return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
  },
  setToken: (token: string) => {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(TOKEN_KEY, token);
  },
  clearToken: () => {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    try {
      localStorage.removeItem(COUNSELLING_CACHE_KEY);
    } catch {
      // ignore
    }
  },
};

/**
 * Safe local storage helper for counselling preferences cache
 */
function getLocalCounsellingCache(): any[] {
  try {
    const cached = localStorage.getItem(COUNSELLING_CACHE_KEY);
    return cached ? JSON.parse(cached) : [];
  } catch {
    return [];
  }
}

function setLocalCounsellingCache(preferences: any[]) {
  try {
    localStorage.setItem(COUNSELLING_CACHE_KEY, JSON.stringify(preferences));
  } catch {
    // ignore
  }
}

/**
 * Helper to safely extract JSON from response, preventing HTML doctype parse errors
 */
async function safelyParseJson<T>(response: Response): Promise<{ ok: boolean; data: T | null; error?: string }> {
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return {
      ok: false,
      data: null,
      error: response.ok
        ? 'Received non-JSON response from server.'
        : `Server returned status ${response.status}`,
    };
  }

  try {
    const json = await response.json();
    return { ok: true, data: json };
  } catch (err: any) {
    return {
      ok: false,
      data: null,
      error: err?.message || 'Failed to parse JSON response.',
    };
  }
}

/**
 * Register a new student account
 */
export async function registerStudent(payload: RegisterPayload) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const parsed = await safelyParseJson<any>(response);
  if (!parsed.ok || !parsed.data) {
    throw new Error(parsed.error || 'Server returned an invalid response. Please try again.');
  }

  if (!response.ok) {
    throw new Error(parsed.data.error || 'Registration failed. Please try again.');
  }

  return parsed.data;
}

/**
 * Log in with registered mobile and password
 */
export async function loginStudent(mobile: string, password: string): Promise<{ token: string; user: AuthenticatedUser }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ mobile, password }),
  });

  const parsed = await safelyParseJson<any>(response);
  if (!parsed.ok || !parsed.data) {
    throw new Error(parsed.error || 'Server returned an invalid response. Please try again.');
  }

  if (!response.ok) {
    throw new Error(parsed.data.error || 'Login failed.');
  }

  authStorage.setToken(parsed.data.token);
  return { token: parsed.data.token, user: parsed.data.user };
}

/**
 * Verify current session with backend
 */
export async function checkCurrentSession(): Promise<AuthenticatedUser | null> {
  const token = authStorage.getToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      authStorage.clearToken();
      return null;
    }

    const parsed = await safelyParseJson<any>(response);
    if (!parsed.ok || !parsed.data || !parsed.data.user) {
      return null;
    }

    return parsed.data.user;
  } catch {
    authStorage.clearToken();
    return null;
  }
}

/**
 * Log out current student and invalidate session
 */
export async function logoutStudent(): Promise<void> {
  const token = authStorage.getToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.warn('Logout network notice:', e);
    }
  }
  authStorage.clearToken();
}

/**
 * Get logged-in student's counselling preferences from backend database
 */
export async function fetchStudentCounselling(): Promise<any[]> {
  const token = authStorage.getToken();
  if (!token) return getLocalCounsellingCache();

  try {
    const response = await fetch('/api/counselling', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      return getLocalCounsellingCache();
    }

    const parsed = await safelyParseJson<any>(response);
    if (!parsed.ok || !parsed.data) {
      return getLocalCounsellingCache();
    }

    const preferences = Array.isArray(parsed.data.preferences) ? parsed.data.preferences : [];
    setLocalCounsellingCache(preferences);
    return preferences;
  } catch (err) {
    console.warn('Unable to sync counselling preferences from server, using local copy:', err);
    return getLocalCounsellingCache();
  }
}

/**
 * Save logged-in student's counselling preferences to backend database
 */
export async function saveStudentCounselling(preferences: any[]): Promise<boolean> {
  // Update local cache immediately for resilience
  setLocalCounsellingCache(preferences);

  const token = authStorage.getToken();
  if (!token) return false;

  try {
    const response = await fetch('/api/counselling', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ preferences }),
    });

    return response.ok;
  } catch (err) {
    console.warn('Unable to persist counselling preferences to remote server:', err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// ADMIN INTERFACES & API FUNCTIONS (SECURE SEPARATE PORTAL)
// ---------------------------------------------------------------------------

export interface AuthenticatedAdmin {
  id: string;
  username: string;
  role: 'admin';
}

export interface AdminStudentSummary {
  id: string;
  fullName: string;
  hallTicket: string;
  rank: number;
  category: string;
  gender: string;
  mobile: string;
  createdAt: string;
  counsellingCount: number;
}

export interface AdminStudentDetailResponse {
  student: AdminStudentSummary;
  counsellingList: any[];
}

const ADMIN_TOKEN_KEY = 'tg_eapcet_admin_token';

export const adminAuthStorage = {
  getToken: (): string | null => {
    return sessionStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  setToken: (token: string) => {
    sessionStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  clearToken: () => {
    sessionStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

/**
 * Log in to the administrator portal
 */
export async function loginAdmin(
  username: string,
  password: string
): Promise<{ token: string; admin: AuthenticatedAdmin }> {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const parsed = await safelyParseJson<any>(response);
  if (!parsed.ok || !parsed.data) {
    throw new Error(parsed.error || 'Invalid server response.');
  }

  if (!response.ok) {
    throw new Error(parsed.data.error || 'Invalid administrator username or password.');
  }

  adminAuthStorage.setToken(parsed.data.token);
  return { token: parsed.data.token, admin: parsed.data.admin };
}

/**
 * Check if current admin session is valid
 */
export async function checkCurrentAdminSession(): Promise<AuthenticatedAdmin | null> {
  const token = adminAuthStorage.getToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/admin/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      adminAuthStorage.clearToken();
      return null;
    }

    const parsed = await safelyParseJson<any>(response);
    if (!parsed.ok || !parsed.data || !parsed.data.admin) {
      return null;
    }

    return parsed.data.admin;
  } catch {
    adminAuthStorage.clearToken();
    return null;
  }
}

/**
 * Log out administrator and invalidate admin session
 */
export async function logoutAdmin(): Promise<void> {
  const token = adminAuthStorage.getToken();
  if (token) {
    try {
      await fetch('/api/admin/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({}),
      });
    } catch (e) {
      console.warn('Admin logout network notice:', e);
    }
  }
  adminAuthStorage.clearToken();
}

/**
 * Fetch all registered students (Admin privilege required)
 */
export async function fetchAdminStudents(): Promise<AdminStudentSummary[]> {
  const token = adminAuthStorage.getToken();
  if (!token) {
    throw new Error('Administrator privileges required.');
  }

  const response = await fetch('/api/admin/students', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const parsed = await safelyParseJson<any>(response);
  if (!parsed.ok || !parsed.data) {
    throw new Error(parsed.error || 'Failed to fetch registered students.');
  }

  if (!response.ok) {
    throw new Error(parsed.data.error || 'Failed to fetch registered students.');
  }

  return parsed.data.students || [];
}

/**
 * Fetch a specific student's details and complete counselling list (Admin privilege required)
 */
export async function fetchAdminStudentDetails(id: string): Promise<AdminStudentDetailResponse> {
  const token = adminAuthStorage.getToken();
  if (!token) {
    throw new Error('Administrator privileges required.');
  }

  const response = await fetch(`/api/admin/students/${encodeURIComponent(id)}`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  const parsed = await safelyParseJson<any>(response);
  if (!parsed.ok || !parsed.data) {
    throw new Error(parsed.error || 'Failed to fetch student details.');
  }

  if (!response.ok) {
    throw new Error(parsed.data.error || 'Failed to fetch student details.');
  }

  return parsed.data;
}

