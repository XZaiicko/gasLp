import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class Cliente {
  private apiUrl = `${environment.apiUrl}/clientes`;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  // Listar todos los clientes
  async getAll() {
    const res = await axios.get(this.apiUrl, this.getHeaders());
    return res.data;
  }

  // Crear nuevo cliente
  async create(cliente: any) {
    const res = await axios.post(
      this.apiUrl,
      { data: cliente },
      this.getHeaders()
    );
    return res.data;
  }

  // Actualizar cliente usando documentId
  async update(documentId: string, cliente: any) {
    const res = await axios.put(
      `${this.apiUrl}/${documentId}`,
      { data: cliente },
      this.getHeaders()
    );
    return res.data;
  }

  // Eliminar cliente usando documentId
  async delete(documentId: string) {
    const res = await axios.delete(
      `${this.apiUrl}/${documentId}`,
      this.getHeaders()
    );
    return res.data;
  }

  async getClienteTelefono(telefono: string) {
    const res = await axios.get(
      `${this.apiUrl}/telefono/${telefono}`,
      this.getHeaders()
    );
    return res.data;
  }
}
