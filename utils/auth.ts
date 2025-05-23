/**
 * Client-side authentication utilities
 */

export interface User {
  username: string;
  token: string;
}

export const AUTH_TOKEN_KEY = "auth_token";

/**
 * Safe base64 decoder for browser environment
 */
function decodeBase64(str: string): string {
  try {
    // Replace URL-safe characters with standard base64 characters
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    // Pad with '=' if necessary
    const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
    // Decode using built-in atob with proper character handling
    return decodeURIComponent(
      Array.prototype.map.call(
        window.atob(padded),
        (c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      ).join('')
    );
  } catch (error) {
    throw new Error('Failed to decode base64 string');
  }
}

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
    const payload = JSON.parse(decodeBase64(parts[1]));
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
    const payload = JSON.parse(decodeBase64(token.split(".")[1]));
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
export async function logout(): Promise<void> {
  // Clear local storage
  removeAuthToken();
  
  // Clear server-side cookie
  try {
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include"
    });
  } catch (error) {
    console.error("Logout error:", error);
  }
  
  // Redirect to login
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