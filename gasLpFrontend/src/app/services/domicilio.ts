import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class Domicilio {
  private apiUrl = `${environment.apiUrl}/domicilios`;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  async create(domicilio: any) {
    const res = await axios.post(
      this.apiUrl,
      { data: domicilio },
      this.getHeaders()
    );
    return res.data;
  }

  async obtenerPorCliente(clienteId: string) {
    const res = await axios.get(
      `${this.apiUrl}?filters[cliente][documentId][$eq]=${clienteId}&populate=*`,
      this.getHeaders()
    );
    return res.data;
  }

  // (Opcional) Actualizar domicilio
  async update(documentId: string, domicilio: any) {
    const res = await axios.put(
      `${this.apiUrl}/${documentId}`,
      { data: domicilio },
      this.getHeaders()
    );
    return res.data;
  }

  // (Opcional) Eliminar domicilio
  async delete(documentId: string) {
    const res = await axios.delete(
      `${this.apiUrl}/${documentId}`,
      this.getHeaders()
    );
    return res.data;
  }
}
