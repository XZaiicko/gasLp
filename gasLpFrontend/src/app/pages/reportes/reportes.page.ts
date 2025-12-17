import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonInfiniteScroll, NavController } from '@ionic/angular';
import { Servicio } from 'src/app/services/servicio';

@Component({
  selector: 'app-reportes',
  templateUrl: './reportes.page.html',
  styleUrls: ['./reportes.page.scss'],
  standalone: false,
})
export class ReportesPage implements OnInit {
  @ViewChild(IonInfiniteScroll) infiniteScroll!: IonInfiniteScroll;

  servicios: any[] = []; // Todos los servicios cargados
  serviciosFiltrados: any[] = []; // Filtrados según filtros
  estados: any[] = [];
  rutas: any[] = [];
  tiposServicio: any[] = [];
  // monto: any[] = [];

  filtroEstado: string = '';
  filtroRuta: string = '';
  filtroTipo: string = '';
  ordenReciente: boolean = true;

  limit: number = 20; // Cantidad a cargar por página
  offset: number = 0; // Paginación
  cargando: boolean = false; // Para evitar multiples cargas

  fechaInicio: string = '';
  fechaFin: string = '';

  constructor(private servicioApi: Servicio, private navCtrl: NavController) {}

  async ngOnInit() {
    await this.loadFiltros();
    await this.loadServicios(true); // true = reiniciar listado
  }

  async loadFiltros() {
    try {
      const estadosRes = await this.servicioApi.getEstados();
      this.estados = estadosRes.data || [];

      const rutasRes = await this.servicioApi.getRutas();
      this.rutas = rutasRes.data || [];

      const tiposRes = await this.servicioApi.getTipos();
      this.tiposServicio = tiposRes.data || [];
    } catch (err) {
      console.error('Error cargando filtros:', err);
    }
  }

  async loadServicios(reset: boolean = false, event?: any) {
    if (this.cargando) return;
    this.cargando = true;

    if (reset) {
      this.offset = 0;
      this.servicios = [];
      this.serviciosFiltrados = [];
    }

    try {
      // Llamada al backend con paginación
      const response = await this.servicioApi.getAllFiltered(
        this.filtroEstado,
        this.filtroRuta,
        this.filtroTipo,
        this.limit,
        this.offset
      );

      const nuevos = Array.isArray(response.data) ? response.data : [];
      this.servicios = [...this.servicios, ...nuevos];
      this.serviciosFiltrados = [...this.servicios];
      this.offset += nuevos.length;

      if (event) event.target.complete();
      if (nuevos.length < this.limit && event) {
        event.target.disabled = true; // deshabilita infinite scroll si no hay más
      }

      console.log('Servicios cargados:', this.servicios);
    } catch (error) {
      console.error('Error al cargar servicios:', error);
      if (event) event.target.complete();
    } finally {
      this.cargando = false;
    }
  }

  // aplicarFiltros() {
  //   this.serviciosFiltrados = this.servicios.filter((s) => {
  //     const matchEstado =
  //       !this.filtroEstado ||
  //       s.estado_servicio?.documentId === this.filtroEstado;
  //     const matchRuta =
  //       !this.filtroRuta || s.ruta?.documentId === this.filtroRuta;
  //     const matchTipo =
  //       !this.filtroTipo || s.tipo_servicio?.documentId === this.filtroTipo;
  //     return matchEstado && matchRuta && matchTipo;
  //   });

  //   // Ordenar
  //   this.serviciosFiltrados.sort((a, b) => {
  //     const dateA = new Date(a.createdAt).getTime();
  //     const dateB = new Date(b.createdAt).getTime();
  //     return this.ordenReciente ? dateB - dateA : dateA - dateB;
  //   });
  // }

  getColorEstado(servicio: any) {
    const estado = servicio.estado_servicio?.tipo?.toLowerCase() || '';
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
        return '#444242ff'; // null o undefined
    }
  }

  loadMore(event: any) {
    this.loadServicios(false, event); // false = no reiniciar
  }

  // async aplicarFiltros() {
  //   try {
  //     console.log(
  //       'Filtrando servicios por fecha:',
  //       this.fechaInicio || this.fechaFin
  //     );

  //     let serviciosFiltrados: any[] = [];

  //     // Filtrar por fecha usando backend
  //     if (this.fechaInicio || this.fechaFin) {
  //       const response = await this.servicioApi.getByFechaRange(
  //         this.fechaInicio,
  //         this.fechaFin
  //       );
  //       serviciosFiltrados = Array.isArray(response.data) ? response.data : [];
  //     }

  //     // Aplicar filtros de estado, ruta y tipo
  //     serviciosFiltrados = serviciosFiltrados.filter((s) => {
  //       const matchEstado =
  //         !this.filtroEstado ||
  //         s.estado_servicio?.documentId === this.filtroEstado;
  //       const matchRuta =
  //         !this.filtroRuta || s.ruta?.documentId === this.filtroRuta;
  //       const matchTipo =
  //         !this.filtroTipo || s.tipo_servicio?.documentId === this.filtroTipo;
  //       return matchEstado && matchRuta && matchTipo;
  //     });

  //     // Ordenar por fecha
  //     serviciosFiltrados.sort((a, b) => {
  //       const dateA = new Date(a.createdAt).getTime();
  //       const dateB = new Date(b.createdAt).getTime();
  //       return this.ordenReciente ? dateB - dateA : dateA - dateB;
  //     });

  //     // Guardar resultados
  //     this.serviciosFiltrados = serviciosFiltrados;

  //     // Deshabilitar infinite scroll si hay filtro de fecha
  //     if (this.infiniteScroll)
  //       this.infiniteScroll.disabled = !!(this.fechaInicio || this.fechaFin);

  //     console.log(
  //       'Servicios filtrados por fecha y otros filtros:',
  //       this.serviciosFiltrados
  //     );
  //   } catch (err) {
  //     console.error('Error aplicando filtros:', err);
  //   }
  // }

  async aplicarFiltros(reset: boolean = true) {
    try {
      let serviciosFiltrados: any[] = [];

      if (this.fechaInicio || this.fechaFin) {
        // Si hay filtro de fecha, traemos todo con getByFechaRange
        const response = await this.servicioApi.getByFechaRange(
          this.fechaInicio,
          this.fechaFin || this.fechaInicio
        );
        serviciosFiltrados = Array.isArray(response.data) ? response.data : [];
        // Deshabilitamos infinite scroll
        if (this.infiniteScroll) this.infiniteScroll.disabled = true;
      } else {
        // Si no hay filtro de fecha, usamos paginación normal
        if (reset) {
          this.offset = 0;
          this.servicios = [];
          this.serviciosFiltrados = [];
          if (this.infiniteScroll) this.infiniteScroll.disabled = false;
        }

        const response = await this.servicioApi.getAllFiltered(
          this.filtroEstado,
          this.filtroRuta,
          this.filtroTipo
        );
        const todosServicios = Array.isArray(response.data)
          ? response.data
          : [];

        // Tomamos solo la página actual según limit + offset
        const nuevos = todosServicios.slice(
          this.offset,
          this.offset + this.limit
        );
        this.offset += this.limit;

        // Agregamos a los arrays de servicios
        this.servicios = [...this.servicios, ...nuevos];
        serviciosFiltrados = [...this.servicios];

        // Si ya no quedan más, deshabilitamos el infinite scroll
        if (nuevos.length < this.limit && this.infiniteScroll) {
          this.infiniteScroll.disabled = true;
        }
      }

      // Aplicar filtros de estado, ruta y tipo
      serviciosFiltrados = serviciosFiltrados.filter((s) => {
        const matchEstado =
          !this.filtroEstado ||
          s.estado_servicio?.documentId === this.filtroEstado;
        const matchRuta =
          !this.filtroRuta || s.ruta?.documentId === this.filtroRuta;
        const matchTipo =
          !this.filtroTipo || s.tipo_servicio?.documentId === this.filtroTipo;
        return matchEstado && matchRuta && matchTipo;
      });

      // Ordenar por fecha
      serviciosFiltrados.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return this.ordenReciente ? dateB - dateA : dateA - dateB;
      });

      this.serviciosFiltrados = serviciosFiltrados;
      console.log('Servicios filtrados:', this.serviciosFiltrados);
    } catch (err) {
      console.error('Error aplicando filtros:', err);
    }
  }

  irDashboard() {
    setTimeout(() => {
      this.navCtrl.navigateRoot('/dashboard');
    }, 0o10);
  }
}
