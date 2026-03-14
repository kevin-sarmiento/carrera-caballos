const API_BASE =
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || '';

export interface User {
  id: number;
  username: string;
  points: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export class ApiService {
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return this.token || localStorage.getItem('token');
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${API_BASE}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.getToken()) {
      headers.Authorization = `Bearer ${this.getToken()}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.request('/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async getUser(): Promise<{ user: User }> {
    return this.request('/user');
  }

  async buyPoints(amount: number): Promise<{ message: string }> {
    return this.request('/buy-points', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  logout() {
    this.token = null;
    localStorage.removeItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }
}

export const api = new ApiService();
