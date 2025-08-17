import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private baseURL = 'http://localhost:8000';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  constructor() {}

  async register(
    name: string,
    email: string,
    password: string,
    gender: string,
    country_id: string,
    date_of_birth: string
  ): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          gender,
          country_id,
          date_of_birth,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem(this.tokenKey, data.token);
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.token) {
          localStorage.setItem(this.tokenKey, data.token);
          localStorage.setItem(this.userKey, JSON.stringify(data.user));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${this.baseURL}/api/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getUser(): any {
    const userData = localStorage.getItem(this.userKey);
    return userData ? JSON.parse(userData) : null;
  }

  // Helper method to get auth headers for API calls
  getAuthHeaders(): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
    });
    const token = this.getToken();
    if (token) {
      headers.append('Authorization', `Bearer ${token}`);
    }
    return headers;
  }
}
