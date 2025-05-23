/**
 * Client-side authentication utilities
 */

export interface User {
  username: string;
  token: string;
}

export const AUTH_TOKEN_KEY = "auth_token";

/**
 * Get the current authentication token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

/**
 * Set the authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

/**
 * Remove the authentication token from localStorage
 */
export function removeAuthToken(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

/**
 * Check if user is authenticated (has valid token)
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    // Basic token validation - check if it's a valid JWT structure
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    
    // Decode payload to check expiration
    const payload = JSON.parse(atob(parts[1]));
    const now = Math.floor(Date.now() / 1000);
    
    return payload.exp > now;
  } catch (error) {
    return false;
  }
}

/**
 * Get user info from token
 */
export function getCurrentUser(): User | null {
  const token = getAuthToken();
  if (!token || !isAuthenticated()) return null;
  
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return {
      username: payload.username,
      token: token
    };
  } catch (error) {
    return null;
  }
}

/**
 * Logout user - remove token and redirect to login
 */
export function logout(): void {
  removeAuthToken();
  window.location.href = "/login";
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  // If unauthorized, logout and redirect
  if (response.status === 401) {
    logout();
    throw new Error("Unauthorized");
  }
  
  return response;
}