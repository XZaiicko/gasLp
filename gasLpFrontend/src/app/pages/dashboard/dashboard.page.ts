import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Servicio } from 'src/app/services/servicio';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: false,
})
export class DashboardPage implements OnInit {
  servicios: any[] = [];
  serviciosFiltrados: any[] = [];
  rutas: any[] = [];
  estados: any[] = [];
  tiposServicio: any[] = [];
  rutaSeleccionada: any[] = [];

  hoy: string = new Date().toLocaleDateString('en-US'); // MM/DD/YYYY

  // filtros
  filtroEstado: string = '';
  filtroTipo: string = '';
  filtroRuta: string = '';
  ordenReciente: boolean = true;

  // paginación
  page: number = 1;
  pageSize: number = 20;

  constructor(
    private router: Router,
    private servicioApi: Servicio,
    private alertCtrl: AlertController,
    private navCtrl: NavController
  ) {}

  async ngOnInit() {
    await this.loadEstados();
    await this.loadRutas();
    await this.loadTiposServicio();
    await this.loadData();

    setInterval(() => this.revisarServiciosProgramados(), 60000);
  }

  async loadEstados() {
    try {
      const res = await this.servicioApi.getEstados();
      this.estados = res.data || [];
      console.log('Estados cargados:', this.estados);
    } catch (err) {
      console.error('Error al cargar estados:', err);
    }
  }

  async loadTiposServicio() {
    try {
      const res = await this.servicioApi.getTipos();
      this.tiposServicio = res.data || [];
      console.log('Tipos de servicio cargados:', this.tiposServicio);
    } catch (err) {
      console.error('Error al cargar tipos de servicio:', err);
    }
  }

  async loadRutas() {
    try {
      const res = await this.servicioApi.getRutas();
      this.rutas = res.data || [];
      console.log('Rutas cargadas:', this.rutas);
    } catch (err) {
      console.error('Error al cargar rutas:', err);
    }
  }

  async loadData() {
    try {
      const serviciosResponse = await this.servicioApi.getServiciosDelDia();
      this.servicios = serviciosResponse.data || [];
      this.page = 1;
      this.aplicarFiltros();
    } catch (err) {
      console.error('Error al cargar datos del día:', err);
    }
  }

  aplicarFiltros() {
    let lista = [...this.servicios];

    if (this.filtroEstado) {
      lista = lista.filter(
        (s) => s.estado_servicio?.documentId === this.filtroEstado
      );
    }

    if (this.filtroTipo) {
      lista = lista.filter(
        (s) => s.tipo_servicio?.documentId === this.filtroTipo
      );
    }

    if (this.filtroRuta) {
      lista = lista.filter((s) => s.ruta?.documentId === this.filtroRuta);
    }

    // ordenar
    lista.sort((a, b) => {
      const fechaA = new Date(a.createdAt).getTime();
      const fechaB = new Date(b.createdAt).getTime();
      return this.ordenReciente ? fechaB - fechaA : fechaA - fechaB;
    });

    // inicializamos serviciosFiltrados con la primera página
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

  irClientes() {
    this.navCtrl.navigateRoot('/cliente');
  }
  irReportes() {
    this.navCtrl.navigateRoot('/reportes');
  }

  getEstadoId(nombre: string) {
    const estado = this.estados.find(
      (e: any) => (e.tipo || e.nombre)?.toLowerCase() === nombre.toLowerCase()
    );
    return estado?.documentId || null;
  }

  async cambiarRuta(servicio: any, rutaDocumentId: string) {
    try {
      await this.servicioApi.updateRuta(servicio.documentId, rutaDocumentId);
      const rutaObj = this.rutas.find((r) => r.documentId === rutaDocumentId);
      servicio.ruta = rutaObj || null;
      this.aplicarFiltros();
    } catch (err) {
      console.error('Error al cambiar ruta:', err);
    }
  }

  async programarFechaHora(servicio: any) {
    const alert = await this.alertCtrl.create({
      header: 'Programar Fecha y Hora',
      inputs: [
        {
          name: 'fecha',
          type: 'date',
          value: new Date().toISOString().split('T')[0],
        },
        { name: 'hora', type: 'time', value: '12:00' },
      ],
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Guardar',
          handler: async (data) => {
            if (!data.fecha || !data.hora) return;
            const fechaISO = new Date(
              `${data.fecha}T${data.hora}`
            ).toISOString();
            try {
              await this.servicioApi.updateFechaProgramado(
                servicio.documentId,
                fechaISO
              );
              const estadoProgramado = this.estados.find(
                (e: any) => (e.tipo || e.nombre)?.toLowerCase() === 'programado'
              );
              if (estadoProgramado) {
                await this.servicioApi.updateEstadoServicio(
                  servicio.documentId,
                  estadoProgramado.documentId
                );
                servicio.estado_servicio = { ...estadoProgramado };
              }
              await this.loadData();
            } catch (err) {
              console.error(err);
            }
          },
        },
      ],
    });
    await alert.present();
  }

  async revisarServiciosProgramados() {
    const ahora = new Date();
    for (let s of this.servicios) {
      if (!s.fecha_programado) continue;
      const fechaProg = new Date(s.fecha_programado);
      if (fechaProg <= ahora) {
        const estadoAsignado = this.estados.find(
          (e: any) => (e.tipo || e.nombre)?.toLowerCase() === 'asignado'
        );
        if (estadoAsignado) {
          try {
            await this.servicioApi.updateEstadoServicio(
              s.documentId,
              estadoAsignado.documentId
            );
            s.estado_servicio = { ...estadoAsignado };
          } catch (err) {
            console.error(err);
          }
        }
      }
    }
  }

  async logOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.navCtrl.navigateRoot('/login');
  }

  async cambiarEstado(servicio: any, estadoDocumentId: string) {
    if (!estadoDocumentId) return;
    try {
      await this.servicioApi.updateEstadoServicio(
        servicio.documentId,
        estadoDocumentId
      );
      const estadoObj = this.estados.find(
        (e) => e.documentId === estadoDocumentId
      );
      if (estadoObj) servicio.estado_servicio = { ...estadoObj };
    } catch (err) {
      console.error(err);
    }
  }

  async marcarComoSurtido(servicio: any) {
    const ahoraISO = new Date().toISOString();
    try {
      await this.servicioApi.updateFechaSurtido(servicio.documentId, ahoraISO);
      const estadoSurtido = this.estados.find(
        (e: any) => (e.tipo || e.nombre)?.toLowerCase() === 'surtido'
      );
      if (estadoSurtido) {
        await this.servicioApi.updateEstadoServicio(
          servicio.documentId,
          estadoSurtido.documentId
        );
        servicio.estado_servicio = { ...estadoSurtido };
      }
    } catch (err) {
      console.error(err);
    }
  }

  async marcarComoCancelado(servicio: any) {
    const ahoraISO = new Date().toISOString();
    try {
      // Actualizar la fecha de cancelación en la DB
      await this.servicioApi.updateFechaCancelado(
        servicio.documentId,
        ahoraISO
      );
      servicio.fecha_cancelado = ahoraISO; // Actualizamos localmente también

      // Actualizar el estado a "cancelado"
      const estadoCancelado = this.estados.find(
        (e: any) => (e.tipo || e.nombre)?.toLowerCase() === 'cancelado'
      );
      if (!estadoCancelado) return;
      await this.servicioApi.updateEstadoServicio(
        servicio.documentId,
        estadoCancelado.documentId
      );
      servicio.estado_servicio = { ...estadoCancelado };
    } catch (err) {
      console.error(err);
    }
  }
}
