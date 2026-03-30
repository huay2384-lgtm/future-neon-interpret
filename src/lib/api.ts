const API_BASE_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : '/api';

export interface User {
  id: string;
  name: string;
  email: string;
  created_at: string;
}

export interface HistoryItem {
  id: string;
  user_id: string;
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  timestamp: string;
}

// User API
export const createUser = async (name: string, email: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });
  if (!response.ok) throw new Error('Failed to create user');
  return response.json();
};

export const getUser = async (id: string): Promise<User> => {
  const response = await fetch(`${API_BASE_URL}/user/${id}`);
  if (!response.ok) throw new Error('Failed to get user');
  return response.json();
};

// History API
export const saveHistory = async (
  user_id: string,
  source_text: string,
  translated_text: string,
  source_lang: string,
  target_lang: string
): Promise<HistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/history`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user_id,
      source_text,
      translated_text,
      source_lang,
      target_lang,
    }),
  });
  if (!response.ok) throw new Error('Failed to save history');
  return response.json();
};

export const getHistory = async (user_id: string): Promise<HistoryItem[]> => {
  const response = await fetch(`${API_BASE_URL}/history/${user_id}`);
  if (!response.ok) throw new Error('Failed to get history');
  return response.json();
};

// Auth API
export const signUp = async (email: string, password: string, name: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, name }),
  });
  if (!response.ok) throw new Error('Failed to sign up');
  return response.json();
};

export const signIn = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new Error('Failed to sign in');
  return response.json();
};

export const signOut = async () => {
  const response = await fetch(`${API_BASE_URL}/auth/signout`, {
    method: 'POST',
  });
  if (!response.ok) throw new Error('Failed to sign out');
  return response.json();
};