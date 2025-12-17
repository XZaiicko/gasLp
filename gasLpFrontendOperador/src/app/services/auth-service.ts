import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import axios from 'axios';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  async login(identifier: string, password: string) {
    return axios.post(`${this.apiUrl}/auth/local`, { identifier, password });
  }

  async forgot(email: string): Promise<{ data: { code: string } }> {
    const res = await axios.post<{ code: string }>(
      `${this.apiUrl}/auth/forgot-password`,
      { email }
    );
    return res;
  }
  async reset(code: string, password: string, passwordConfirmation: string) {
    return axios.post(`${this.apiUrl}/auth/reset-password`, {
      code,
      password,
      passwordConfirmation,
    });
  }

  async loginGoogle(access_token: string) {
    return axios.get(
      `${this.apiUrl}/auth/google/callback?access_token=${access_token}`
    );
  }

  async getPersonalByUserId(userId: number) {
    const token = localStorage.getItem('token'); // tu JWT
    if (!token) throw new Error('Usuario no autenticado');

    try {
      const resp = await axios.get(
        `${this.apiUrl}/personals?filters[users_permissions_user][id][$eq]=${userId}&populate=ruta`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return resp.data;
    } catch (err) {
      console.error('Error obteniendo personal:', err);
      throw err;
    }
  }
}
