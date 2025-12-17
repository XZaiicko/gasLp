import { Injectable } from '@angular/core';
import axios from 'axios';
import { AnyCatcher } from 'rxjs/internal/AnyCatcher';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root',
})
export class Servicio {
  private apiUrl = `${environment.apiUrl}/servicios`;

  private getHeaders() {
    const token = localStorage.getItem('token');
    return {
      headers: { Authorization: `Bearer ${token}` },
    };
  }

  async create(servicio: any) {
    const res = await axios.post(
      this.apiUrl,
      { data: servicio },
      this.getHeaders()
    );
    return res.data;
  }

  async getAll() {
    try {
      const url = `${this.apiUrl}?populate[domicilio]=true&populate[ruta]=true&populate[tipo_servicio]=true&populate[estado_servicio]=true`;
      const res = await axios.get(url, this.getHeaders());
      console.log('Servicios obtenidos:', res.data);
      return res.data;
    } catch (error: any) {
      console.error(
        'Error al obtener servicios:',
        error.response?.data || error
      );
      throw error;
    }
  }

  async update(documentId: string, servicio: any) {
    const res = await axios.put(
      `${this.apiUrl}/${documentId}`,
      { data: servicio },
      this.getHeaders()
    );
    return res.data;
  }

  async delete(documentId: string) {
    const res = await axios.delete(
      `${this.apiUrl}/${documentId}`,
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

  async getEstados() {
    const res = await axios.get(
      `${environment.apiUrl}/estado-servicios`,
      this.getHeaders()
    );
    return res.data;
  }

  async getRutas() {
    const res = await axios.get(
      `${environment.apiUrl}/rutas?populate=personal`,
      this.getHeaders()
    );
    return res.data;
  }

  async updateRuta(servicioDocumentId: string, rutaDocumentId: string) {
    console.log(`Buscando servicio con documentId: ${servicioDocumentId}`);
    console.log(`Buscando ruta con documentId: ${rutaDocumentId}`);

    try {
      // Buscar ruta para obtener su id interno
      const resRuta = await axios.get(
        `${environment.apiUrl}/rutas?filters[documentId][$eq]=${rutaDocumentId}`,
        this.getHeaders()
      );
      const ruta = resRuta.data.data[0];
      if (!ruta) throw new Error('No se encontró la ruta.');
      const rutaId = ruta.id;
      console.log(
        `Ruta encontrada. ID interno: ${rutaId}, nombre: ${
          ruta.attributes?.nombre || ruta.nombre
        }`
      );

      // Actualizar servicio usando documentId directamente en la URL
      const resPut = await axios.put(
        `${this.apiUrl}/${servicioDocumentId}`,
        { data: { ruta: rutaId } }, // Conecta la ruta
        this.getHeaders()
      );

      console.log('Ruta actualizada correctamente:', resPut.data);
      return resPut.data;
    } catch (error) {
      console.error('Error en updateRuta:', error);
      throw error;
    }
  }

  async updateFechaProgramado(documentId: string, fecha: string) {
    try {
      console.log(
        `Actualizando fecha_programado del servicio ${documentId} a ${fecha}`
      );

      const resPut = await axios.put(
        `${this.apiUrl}/${documentId}`,
        { data: { fecha_programado: fecha } },
        this.getHeaders()
      );

      console.log('Fecha programada correctamente:', resPut.data);
      return resPut.data;
    } catch (err: any) {
      console.error(
        'Error en updateFechaProgramado:',
        err.response?.data || err
      );
      throw err;
    }
  }

  async updateEstadoServicio(
    servicioDocumentId: string,
    estadoDocumentId: string
  ) {
    console.log(
      `Intentando actualizar estado del servicio ${servicioDocumentId} al estado ${estadoDocumentId}`
    );

    try {
      // PUT directo con documentId del estado
      const resPut = await axios.put(
        `${this.apiUrl}/${servicioDocumentId}`,
        { data: { estado_servicio: estadoDocumentId } }, // aquí cambiamos
        this.getHeaders()
      );

      console.log('Estado actualizado correctamente:', resPut.data);
      return resPut.data;
    } catch (error) {
      console.error('Error en updateEstadoServicio:', error);
      throw error;
    }
  }

  async updateFechaSurtido(documentId: string, fecha: string) {
    try {
      console.log(
        `Actualizando fecha_surtido del servicio ${documentId} a ${fecha}`
      );

      const resPut = await axios.put(
        `${this.apiUrl}/${documentId}`,
        { data: { fecha_surtido: fecha } },
        this.getHeaders()
      );

      console.log('Fecha de surtido actualizada correctamente:', resPut.data);
      return resPut.data;
    } catch (err: any) {
      console.error('Error en updateFechaSurtido:', err.response?.data || err);
      throw err;
    }
  }

  async updateFechaCancelado(documentId: string, fecha: string) {
    try {
      console.log(
        `Actualizando fecha_cancelado del servicio ${documentId} a ${fecha}`
      );

      const resPut = await axios.put(
        `${this.apiUrl}/${documentId}`,
        { data: { fecha_cancelado: fecha } },
        this.getHeaders()
      );

      console.log('Fecha cancelada correctamente:', resPut.data);
      return resPut.data;
    } catch (err: any) {
      console.error(
        'Error en updateFechaCancelado:',
        err.response?.data || err
      );
      throw err;
    }
  }

  async getAllFiltered(
    estadoId: string = '',
    rutaId: string = '',
    tipoId: string = '',
    limit: number = 20,
    offset: number = 0
  ) {
    const filtros: string[] = [];
    if (estadoId)
      filtros.push(`filters[estado_servicio][documentId][$eq]=${estadoId}`);
    if (rutaId) filtros.push(`filters[ruta][documentId][$eq]=${rutaId}`);
    if (tipoId)
      filtros.push(`filters[tipo_servicio][documentId][$eq]=${tipoId}`);

    const queryParams =
      filtros.length > 0
        ? '?' +
          filtros.join('&') +
          `&pagination[limit]=${limit}&pagination[start]=${offset}`
        : `?pagination[limit]=${limit}&pagination[start]=${offset}`;

    const url = `${this.apiUrl}${queryParams}&populate[domicilio]=true&populate[ruta]=true&populate[tipo_servicio]=true&populate[estado_servicio]=true`;

    const res = await axios.get(url, this.getHeaders());
    return res.data;
  }

  async getServiciosDelDia() {
    try {
      const hoy = new Date(); // Fecha actual
      const hoyInicio = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        0,
        0,
        0
      );
      const hoyFin = new Date(
        hoy.getFullYear(),
        hoy.getMonth(),
        hoy.getDate(),
        23,
        59,
        59
      );

      const url = `${
        this.apiUrl
      }?filters[createdAt][$gte]=${hoyInicio.toISOString()}&filters[createdAt][$lte]=${hoyFin.toISOString()}&populate[domicilio]=true&populate[ruta]=true&populate[tipo_servicio]=true&populate[estado_servicio]=true`;

      const res = await axios.get(url, this.getHeaders());
      return res.data;
    } catch (err: any) {
      console.error(
        'Error al obtener servicios del día:',
        err.response?.data || err
      );
      throw err;
    }
  }

  async getByFechaRange(fechaInicio: string, fechaFin: string) {
    try {
      if (!fechaInicio || !fechaFin) {
        throw new Error('Debe especificarse fechaInicio y fechaFin válidas.');
      }

      const inicioObj = new Date(fechaInicio);
      inicioObj.setHours(0, 0, 0, 0);

      const finObj = new Date(fechaFin);
      finObj.setDate(finObj.getDate() + 1); // pasamos al día siguiente
      finObj.setHours(0, 0, 0, 0); // inicio del día siguiente

      const url = `${
        this.apiUrl
      }?filters[createdAt][$gte]=${inicioObj.toISOString()}&filters[createdAt][$lt]=${finObj.toISOString()}&populate[domicilio]=true&populate[ruta]=true&populate[tipo_servicio]=true&populate[estado_servicio]=true`;

      const res = await axios.get(url, this.getHeaders());
      console.log('Servicios filtrados por rango de fechas:', res.data);
      return res.data;
    } catch (err: any) {
      console.error('Error en getByFechaRange:', err.message || err);
      throw err;
    }
  }
}
