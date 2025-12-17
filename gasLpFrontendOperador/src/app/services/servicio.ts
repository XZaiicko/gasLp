import { Injectable } from '@angular/core';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class Servicio {
  private apiUrl = `${environment.apiUrl}/servicios-by-ruta`;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  /** Traer todos los servicios de una ruta específica */
  async getAllCliente(rutaDocumentId: string) {
    try {
      const res = await axios.get(
        `${environment.apiUrl}/servicios-by-ruta/${rutaDocumentId}`,
        this.getHeaders()
      );

      // Mapear los datos para incluir cliente y domicilio
      const servicios = (res.data.data || []).map((s: any) => {
        return {
          ...s,
          clienteNombre: s.cliente?.nombre || 'Sin cliente',
          clienteTelefono: s.cliente?.telefono || 'Sin teléfono',
          direccion: s.domicilio
            ? `${s.domicilio.calle || ''} ${s.domicilio.numero || ''}, ${
                s.domicilio.colonia || ''
              }`
            : 'Sin dirección',
        };
      });

      return servicios;
    } catch (err) {
      console.error('Error al obtener servicios por ruta:', err);
      return [];
    }
  }

  /** Rutas y filtros **/
  async getRutaOperador(userId: number) {
    const res = await axios.get(
      `${environment.apiUrl}/personals?filters[users_permissions_user][id][$eq]=${userId}&populate=ruta`,
      this.getHeaders()
    );
    return res.data.data[0]?.ruta || null;
  }

  async getEstados() {
    const res = await axios.get(
      `${environment.apiUrl}/estado-servicios`,
      this.getHeaders()
    );
    return res.data;
  }

  async getTipos() {
    const res = await axios.get(
      `${environment.apiUrl}/tipo-servicios`,
      this.getHeaders()
    );
    return res.data;
  }

  async getRutas() {
    const res = await axios.get(
      `${environment.apiUrl}/rutas`,
      this.getHeaders()
    );
    return res.data;
  }

  /** Servicios **/
  async getServiciosPorRuta(rutaDocumentId: string) {
    const res = await axios.get(
      `${this.apiUrl}/${rutaDocumentId}`,
      this.getHeaders()
    );
    return res.data.data;
  }

  async getServiciosDelDia() {
    const res = await axios.get(
      `${environment.apiUrl}/servicios?populate=cliente,domicilio,estado_servicio,tipo_servicio,ruta`,
      this.getHeaders()
    );
    const hoy = new Date().toISOString().split('T')[0];
    // Filtrar solo los servicios cuyo createdAt sea de hoy
    res.data.data = res.data.data.filter(
      (s: any) => s.createdAt?.split('T')[0] === hoy
    );
    return res.data;
  }

  /** Actualizaciones de servicios **/
  async updateRuta(servicioDocumentId: string, rutaDocumentId: string) {
    const res = await axios.put(
      `${environment.apiUrl}/servicios/${servicioDocumentId}`,
      { data: { ruta: rutaDocumentId } },
      this.getHeaders()
    );
    return res.data;
  }

  async updateEstadoServicio(
    servicioDocumentId: string,
    estadoDocumentId: string
  ) {
    const res = await axios.put(
      `${environment.apiUrl}/servicios/${servicioDocumentId}`,
      { data: { estado_servicio: estadoDocumentId } },
      this.getHeaders()
    );
    return res.data;
  }

  async updateFechaProgramado(servicioDocumentId: string, fechaISO: string) {
    const res = await axios.put(
      `${environment.apiUrl}/servicios/${servicioDocumentId}`,
      { data: { fecha_programado: fechaISO } },
      this.getHeaders()
    );
    return res.data;
  }

  async updateFechaSurtido(servicioDocumentId: string, fechaISO: string) {
    const res = await axios.put(
      `${environment.apiUrl}/servicios/${servicioDocumentId}`,
      { data: { fecha_surtido: fechaISO } },
      this.getHeaders()
    );
    return res.data;
  }

  async updateFechaCancelado(servicioDocumentId: string, fechaISO: string) {
    const res = await axios.put(
      `${environment.apiUrl}/servicios/${servicioDocumentId}`,
      { data: { fecha_cancelado: fechaISO } },
      this.getHeaders()
    );
    return res.data;
  }

  /** Marcar como surtido (actualiza fecha y estado) **/
  async marcarComoSurtido(servicioDocumentId: string) {
    const fechaSurtido = new Date().toISOString();
    const estadoSurtidoId = await this.getEstadoSurtidoId();

    const res = await axios.put(
      `${environment.apiUrl}/servicios/${servicioDocumentId}`,
      {
        data: { fecha_surtido: fechaSurtido, estado_servicio: estadoSurtidoId },
      },
      this.getHeaders()
    );
    return res.data;
  }

  /** Obtener ID del estado "surtido" **/
  private async getEstadoSurtidoId(): Promise<string> {
    const res = await axios.get(
      `${environment.apiUrl}/estado-servicios`,
      this.getHeaders()
    );
    const estado = res.data.data.find(
      (e: any) => (e.tipo || e.nombre)?.toLowerCase() === 'surtido'
    );
    if (!estado) throw new Error('Estado "surtido" no encontrado');
    return estado.documentId;
  }

  async marcarComoSurtidoConMonto(
    servicioDocumentId: string,
    monto: number,
    observacion?: string
  ) {
    const fechaSurtido = new Date().toISOString();
    const estadoSurtidoId = await this.getEstadoSurtidoId();

    const payload: any = {
      data: {
        monto,
        fecha_surtido: fechaSurtido,
        estado_servicio: estadoSurtidoId,
      },
    };

    if (observacion) payload.data.observacion = observacion;

    const res = await axios.put(
      `${environment.apiUrl}/servicios/${servicioDocumentId}`,
      payload,
      this.getHeaders()
    );

    return res.data;
  }
}
