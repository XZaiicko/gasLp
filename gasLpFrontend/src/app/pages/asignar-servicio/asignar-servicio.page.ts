import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Cliente } from 'src/app/services/cliente';
import { Domicilio } from 'src/app/services/domicilio';
import { Servicio } from 'src/app/services/servicio';

@Component({
  selector: 'app-asignar-servicio',
  templateUrl: './asignar-servicio.page.html',
  styleUrls: ['./asignar-servicio.page.scss'],
  standalone: false,
})
export class AsignarServicioPage implements OnInit {
  cliente: any;
  domicilios: any[] = [];
  tiposServicios: any[] = [];
  clienteDocumentId: string = '';
  telefonoCliente: string = '';
  rutas: any[] = [];

  formServicio = {
    domicilio: '',
    tipo_servicio: '',
    ruta: '',
    estado_servicio: '',
    observacion: '',
    nota: '',
    fecha_programado: '',
  };

  constructor(
    private route: ActivatedRoute,
    private clienteService: Cliente,
    private domicilioService: Domicilio,
    private servicioService: Servicio,
    private router: Router,
    private alert: AlertController,
    private navctrl: NavController
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe(async (params) => {
      this.telefonoCliente = params.get('id') || '';
      if (!this.telefonoCliente) {
        this.presentAlert('Error', '', 'Cliente no encontrado');
        return;
      }

      try {
        const res = await this.clienteService.getClienteTelefono(
          this.telefonoCliente
        );
        this.cliente = Array.isArray(res) ? res[0] : res;
        this.clienteDocumentId = this.cliente.documentId || this.cliente.id;

        const domRes = await this.domicilioService.obtenerPorCliente(
          this.clienteDocumentId
        );
        this.domicilios = domRes.data || [];

        const tipoRes = await this.servicioService.getTipos();
        this.tiposServicios = tipoRes.data || [];

        const rutasRes = await this.servicioService.getRutas(); // ✅ NUEVO
        this.rutas = rutasRes.data || []; // ✅ NUEVO

        this.formServicio.estado_servicio = '1';

        if (this.domicilios.length > 0) {
          this.formServicio.domicilio = this.domicilios[0].documentId;
        }
        if (this.rutas.length > 0) {
          // ✅ auto seleccionado
          this.formServicio.ruta = this.rutas[0].documentId;
        }

        console.log('Cliente cargado:', this.cliente);
        console.log('Domicilios cargados:', this.domicilios);
        console.log('Tipos de servicio cargados:', this.tiposServicios);
        console.log('Rutas cargadas:', this.rutas); // ✅
      } catch (err) {
        console.error(err);
        this.presentAlert('Error', '', 'No se pudieron cargar los datos');
      }
    });
  }

  async guardarServicio() {
    if (!this.cliente?.documentId) {
      return this.presentAlert('Error', '', 'No hay cliente seleccionado');
    }

    const servicioData = {
      cliente: this.clienteDocumentId,
      domicilio: this.formServicio.domicilio,
      tipo_servicio: this.formServicio.tipo_servicio,
      ruta: this.formServicio.ruta, // ✅ NUEVO
      estado_servicio: this.formServicio.estado_servicio,
      observacion: this.formServicio.observacion || '',
      nota: this.formServicio.nota || '',
      fecha_programado: this.formServicio.fecha_programado || null,
    };

    try {
      const res = await this.servicioService.create(servicioData);
      console.log('Servicio creado:', res);
      await this.presentAlert('Éxito', '', 'Servicio creado correctamente');
      this.navctrl.navigateRoot(['/dashboard']);
    } catch (error: any) {
      console.error('Error al crear servicio', error);
      if (error.response) {
        this.presentAlert(
          'Error',
          '',
          'Detalles: ' + JSON.stringify(error.response.data.error, null, 2)
        );
      } else {
        this.presentAlert('Error', '', 'No se pudo crear el servicio');
      }
    }
  }

  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alert.create({
      header,
      subHeader,
      message,
      buttons: ['OK'],
      mode: 'ios',
    });
    await alert.present();
  }
}
