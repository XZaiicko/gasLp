import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { Servicio } from 'src/app/services/servicio';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  estados: any[] = [];
  observacion: any[] = [];
  nota: any[] = [];

  filtroEstado: string = '';

  // paginación
  page: number = 1;
  pageSize: number = 20;

  constructor(
    private servicioApi: Servicio,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.loadEstados();
    // await this.loadServiciosDelDia();
    // await this.loadCliente();
    await this.loadServiciosDelDiaConClientes();
  }

  estadosFiltrados: any[] = [];

  async loadEstados() {
    try {
      const res = await this.servicioApi.getEstados();
      this.estados = res.data || [];

      // Filtramos aquí los estados que no queremos mostrar
      this.estadosFiltrados = this.estados.filter(
        (e) => (e.tipo || e.nombre)?.toLowerCase() !== 'registrado'
      );
    } catch (err) {
      console.error('Error al cargar estados:', err);
    }
  }

  // async loadCliente() {
  //   try {
  //     // Obtener el operador desde localStorage
  //     const operadorStr = localStorage.getItem('operador');
  //     if (!operadorStr) {
  //       console.warn('No hay operador logueado');
  //       return;
  //     }

  //     const operador = JSON.parse(operadorStr);
  //     const rutaAsignada = operador.rutaAsignada;

  //     if (!rutaAsignada) {
  //       console.warn('No hay ruta asignada para este operador');
  //       return;
  //     }

  //     // Llamada al servicio usando la ruta correcta
  //     const res = await this.servicioApi.getAllCliente(rutaAsignada);
  //     const serviciosRaw = res || [];

  //     this.servicios = serviciosRaw.map((s: any) => ({
  //       documentId: s.documentId || s.id,
  //       clienteNombre: s.clienteNombre || 'Sin cliente',
  //       clienteTelefono: s.clienteTelefono || 'Sin teléfono',
  //     }));

  //     console.log('Clientes cargados:', this.servicios);

  //     this.page = 1;
  //     this.aplicarFiltros();
  //   } catch (err) {
  //     console.error('Error al cargar clientes:', err);
  //   }
  // }

  // async loadServiciosDelDia() {
  //   try {
  //     const res = await this.servicioApi.getServiciosDelDia();
  //     console.log('Servicios del día RAW:', res.data);

  //     // Mapear cada servicio para agregar cliente, dirección y teléfono
  //     this.servicios = (res.data || []).map((s: any) => {
  //       return {
  //         ...s,
  //         clienteNombre: s.cliente?.data?.attributes?.nombre || 'Sin cliente',
  //         clienteTelefono:
  //           s.cliente?.data?.attributes?.telefono || 'Sin teléfono',

  //         direccion: s.domicilio
  //           ? `${s.domicilio.calle || ''} ${s.domicilio.numero || ''}, ${
  //               s.domicilio.colonia || ''
  //             }`
  //           : 'Sin dirección',
  //       };
  //     });

  //     this.page = 1;
  //     this.aplicarFiltros();
  //   } catch (err) {
  //     console.error('Error al cargar servicios del día:', err);
  //   }
  // }

  // async loadServiciosDelDiaConClientes() {
  //   try {
  //     const operadorStr = localStorage.getItem('operador');
  //     if (!operadorStr) return;
  //     const operador = JSON.parse(operadorStr);
  //     const rutaAsignada = operador.rutaAsignada;
  //     if (!rutaAsignada) return;

  //     // Trae todos los servicios de la ruta, incluyendo cliente y monto
  //     const serviciosRaw = await this.servicioApi.getAllCliente(rutaAsignada);

  //     this.servicios = serviciosRaw.map((s: any) => ({
  //       documentId: s.documentId || s.id,
  //       clienteNombre: s.clienteNombre || 'Sin cliente',
  //       clienteTelefono: s.clienteTelefono || 'Sin teléfono',
  //       direccion: s.domicilio
  //         ? `${s.domicilio.calle || ''} ${s.domicilio.numero || ''}, ${
  //             s.domicilio.colonia || ''
  //           }`
  //         : 'Sin dirección',
  //       estado_servicio: s.estado_servicio || { tipo: 'desconocido' },
  //       fecha_programado: s.fecha_programado || null,
  //       fecha_surtido: s.fecha_surtido || null,
  //       monto_pagado: s.monto || null, // <- Aquí se asigna el monto del backend
  //       createdAt: s.createdAt || new Date().toISOString(),
  //     }));

  //     this.page = 1;
  //     this.aplicarFiltros();
  //   } catch (err) {
  //     console.error('Error al cargar servicios con clientes:', err);
  //   }
  // }

  async loadServiciosDelDiaConClientes() {
    try {
      const operadorStr = localStorage.getItem('operador');
      if (!operadorStr) return;
      const operador = JSON.parse(operadorStr);
      const rutaAsignada = operador.rutaAsignada;
      if (!rutaAsignada) return;

      // Trae todos los servicios de la ruta
      const serviciosRaw = await this.servicioApi.getAllCliente(rutaAsignada);

      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      this.servicios = serviciosRaw
        .map((s: any) => ({
          documentId: s.documentId || s.id,
          clienteNombre: s.clienteNombre || 'Sin cliente',
          clienteTelefono: s.clienteTelefono || 'Sin teléfono',
          direccion: s.domicilio
            ? `${s.domicilio.calle || ''} ${s.domicilio.numero || ''}, ${
                s.domicilio.colonia || ''
              }`
            : 'Sin dirección',
          estado_servicio: s.estado_servicio || { tipo: 'desconocido' },
          fecha_programado: s.fecha_programado
            ? new Date(s.fecha_programado)
            : null,
          fecha_surtido: s.fecha_surtido ? new Date(s.fecha_surtido) : null,
          fecha_cancelado: s.fecha_cancelado
            ? new Date(s.fecha_cancelado)
            : null, // ← aquí
          monto_pagado: s.monto || null,
          createdAt: s.createdAt ? new Date(s.createdAt) : new Date(),
          nota: s.nota || '',
        }))
        .filter((s: any) => {
          const fechaServicio = s.fecha_programado || s.createdAt;
          const servicioDia = new Date(fechaServicio);
          servicioDia.setHours(0, 0, 0, 0);
          return servicioDia.getTime() === hoy.getTime();
        });

      this.page = 1;
      this.aplicarFiltros();
    } catch (err) {
      console.error('Error al cargar servicios con clientes:', err);
    }
  }
  async marcarComoSurtido(servicio: any) {
    const alert = await this.alertCtrl.create({
      header: 'Surtir Servicio',
      message: 'Ingresa el monto surtido y observaciones:',
      inputs: [
        {
          name: 'monto',
          type: 'number',
          placeholder: '0.00',
        },
        {
          name: 'observacion',
          type: 'textarea',
          placeholder: 'Escribe una observación (opcional)',
        },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Aceptar',
          handler: async (data) => {
            const monto = parseFloat(data.monto);
            const observacion = data.observacion?.trim() || '';

            if (isNaN(monto) || monto <= 0) return false;

            try {
              // Llamada al backend, ahora también puedes enviar la observación
              await this.servicioApi.marcarComoSurtidoConMonto(
                servicio.documentId,
                monto,
                observacion
              );

              // Actualizar localmente para reflejar cambios inmediatamente
              servicio.monto_pagado = monto;
              servicio.fecha_surtido = new Date().toISOString();
              servicio.observacion = observacion;
              if (servicio.estado_servicio) {
                servicio.estado_servicio.tipo = 'surtido';
              } else {
                servicio.estado_servicio = { tipo: 'surtido' };
              }

              this.servicios = [...this.servicios];
              this.aplicarFiltros();

              return true;
            } catch (err) {
              console.error('Error al marcar como surtido:', err);
              return false;
            }
          },
        },
      ],
    });

    await alert.present();
  }

  aplicarFiltros() {
    let lista = [...this.servicios];

    // FILTRAR POR ESTADO seleccionado en el segmento
    if (this.filtroEstado) {
      lista = lista.filter(
        (s) =>
          (s.estado_servicio?.tipo?.toLowerCase() || '') === this.filtroEstado
      );
    }

    // FILTRAR PARA EXCLUIR SERVICIOS "registrado"
    lista = lista.filter(
      (s) => (s.estado_servicio?.tipo?.toLowerCase() || '') !== 'registrado'
    );

    // ordenar por más recientes
    lista.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    this.serviciosFiltrados = lista.slice(0, this.pageSize);
  }

  async loadMore(event: any) {
    this.page++;
    const start = (this.page - 1) * this.pageSize;
    const end = this.page * this.pageSize;
    const nextItems = this.servicios.slice(start, end);

    this.serviciosFiltrados = this.serviciosFiltrados.concat(nextItems);
    event.target.complete();

    if (this.serviciosFiltrados.length >= this.servicios.length) {
      event.target.disabled = true;
    }
  }

  getColorEstado(servicio: any) {
    const estado =
      servicio?.estado_servicio?.tipo?.toLowerCase() || 'desconocido';
    switch (estado) {
      case 'registrado':
        return '#cfb8b8ff';
      case 'asignado':
        return '#4c85ffff';
      case 'programado':
        return '#57879bff';
      case 'cancelado':
        return '#fa3838ff';
      case 'surtido':
        return '#00ff73ff';
      default:
        return '#444242ff';
    }
  }

  getIconEstado(estadoTipo: string) {
    switch (estadoTipo.toLowerCase()) {
      // case 'registrado':
      //   return 'document-text-outline';
      case 'asignado':
        return 'person-outline';
      case 'programado':
        return 'calendar-outline';
      case 'cancelado':
        return 'close-circle-outline';
      case 'surtido':
        return 'checkmark-circle-outline';
      default:
        return '';
    }
  }

  // async marcarComoSurtido(servicio: any) {
  //   const alert = await this.alertCtrl.create({
  //     header: 'Surtir Servicio',
  //     message: 'Ingresa el monto surtido:',
  //     inputs: [
  //       {
  //         name: 'monto',
  //         type: 'number',
  //         placeholder: '0.00',
  //       },
  //     ],
  //     buttons: [
  //       {
  //         text: 'Cancelar',
  //         role: 'cancel',
  //       },
  //       {
  //         text: 'Aceptar',
  //         handler: async (data) => {
  //           const monto = parseFloat(data.monto);
  //           if (isNaN(monto) || monto <= 0) {
  //             console.warn('Monto inválido:', data.monto);
  //             return false; // evita cerrar el alert si es inválido
  //           }

  //           try {
  //             // Actualiza monto + fecha_surtido + estado en un solo request
  //             await this.servicioApi.marcarComoSurtidoConMonto(
  //               servicio.documentId,
  //               monto
  //             );

  //             // Actualiza localmente el servicio para reflejar cambios en la UI
  //             const estadoSurtido = this.estados.find(
  //               (e) => (e.tipo || e.nombre)?.toLowerCase() === 'surtido'
  //             );
  //             if (estadoSurtido) {
  //               servicio.monto_pagado = monto;
  //               servicio.estado_servicio = { ...estadoSurtido };
  //               servicio.fecha_surtido = new Date().toISOString();
  //             }

  //             return true; // cierra el alert
  //           } catch (err) {
  //             console.error('Error al marcar como surtido:', err);
  //             return false; // mantiene el alert abierto
  //           }
  //         },
  //       },
  //     ],
  //   });

  //   await alert.present();
  // }

  logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.navCtrl.navigateRoot('/login');
  }
}
