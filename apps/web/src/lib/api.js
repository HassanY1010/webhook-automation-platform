"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequest = apiRequest;
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
async function apiRequest(endpoint, options = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    try {
        const res = await fetch(`${API_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
            ...options,
            headers,
        });
        const json = await res.json();
        return json;
    }
    catch (err) {
        return {
            success: false,
            error: { message: err.message || 'Network request failed' },
        };
    }
}
//# sourceMappingURL=api.js.map