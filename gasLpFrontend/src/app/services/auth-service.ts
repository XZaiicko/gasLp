import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  async login(identifier: string, password: string) {
    // return axios.post(this.apiUrl + '/auth/local',{
    //   identifier,
    //   password
    // });

    return axios.post(`${this.apiUrl}/auth/local`, {
      identifier,
      password,
    });
  }

  async forgot(email: string) {
    return axios.post(`${this.apiUrl}/auth/forgot-password`, {
      email,
    });
  }

  async reset(data: {
    code: string;
    password: string;
    passwordConfirmation: string;
  }) {
    console.log('DATA ENVIADA A STRAPI:', data);

    try {
      const res = await axios.post(`${this.apiUrl}/auth/reset-password`, data);
      console.log('RESPUESTA STRAPI:', res.data);
      return res.data;
    } catch (err) {
      console.error('ERROR STRAPI:', err);
      throw err;
    }
  }

  async loginGoogle(access_token: string) {
    return axios.get(
      `${this.apiUrl}/auth/google/callback?access_token=${access_token}`
    );
  }
}
