const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: any; meta?: any; message?: any; statusCode?: number }> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const url = `${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const res = await fetch(url, {
      mode: 'cors',
      ...options,
      headers,
    });

    let json: any;
    try {
      json = await res.json();
    } catch {
      json = null;
    }

    if (!res.ok) {
      const fallbackMsg = res.status === 401
        ? 'Invalid email or password'
        : res.status === 409
        ? 'Resource with this email already exists'
        : res.status === 500
        ? 'Server encountered an internal error. Please try again later.'
        : `Request failed with status ${res.status}`;

      const errorMsg = json?.message || json?.error || fallbackMsg;

      return {
        success: false,
        statusCode: res.status,
        message: errorMsg,
        error: { message: Array.isArray(errorMsg) ? errorMsg[0] : errorMsg },
        data: json?.data,
      };
    }

    // Success response
    if (json && typeof json === 'object') {
      return {
        success: json.success !== undefined ? json.success : true,
        data: json.data !== undefined ? json.data : json,
        meta: json.meta,
        message: json.message,
        statusCode: res.status,
      };
    }

    return {
      success: true,
      statusCode: res.status,
      data: json,
    };
  } catch (err: any) {
    return {
      success: false,
      statusCode: 0,
      error: { message: err.message || 'Cannot connect to server. Please check your connection.' },
    };
  }
}
