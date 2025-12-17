import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { Cliente } from 'src/app/services/cliente';
import { Domicilio } from 'src/app/services/domicilio';

@Component({
  selector: 'app-cliente',
  templateUrl: './cliente.page.html',
  styleUrls: ['./cliente.page.scss'],
  standalone: false,
})
export class ClientePage implements OnInit {
  clientes: any[] = [];
  domicilios: any[] = [];
  domicilioSeleccionado: any = null;
  formCliente = { nombre: '', apellido: '', telefono: '' };
  formDomicilio = {
    calle: '',
    numero: '',
    colonia: '',
    referencia: '',
    cp: '',
  };
  editando: any = null;
  telefonoBusqueda: string = '';

  mostrarFormulario: boolean = false;

  constructor(
    private alert: AlertController,
    private cliente: Cliente,
    private domicilio: Domicilio,
    private router: Router,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.cargarClientes();
  }

  // Botón X / cancelar búsqueda
  cancelarBusqueda() {
    this.telefonoBusqueda = '';
    this.mostrarFormulario = false;
    this.cargarClientes();
  }

  // Botón Registrar
  abrirFormularioConTelefono() {
    this.mostrarFormulario = true;
    this.editando = null;
    this.formCliente.telefono = this.telefonoBusqueda;
  }

  // Botón en header
  abrirFormulario() {
    this.mostrarFormulario = true;
    this.editando = null;
    this.formCliente = { nombre: '', apellido: '', telefono: '' };
    this.resetFormDomicilio();
  }

  // Función para validar si el teléfono ya existe
  telefonoExiste(tel: string) {
    return this.clientes.some(
      (c) => (c.attributes?.telefono || c.telefono) === tel
    );
  }

  // Opcional: actualizar dinámicamente al escribir
  onTelefonoInput() {
    // Esto fuerza el check de telefonoExiste para mostrar/ocultar el botón Registrar
  }

  async cargarClientes() {
    try {
      const res = await this.cliente.getAll();
      this.clientes = res.data || res;
    } catch (err) {
      console.error('Error al cargar clientes', err);
    }
  }

  async crearCliente() {
    if (!this.formCliente.telefono || !this.formCliente.nombre) {
      return this.presentAlert(
        'Error',
        '',
        'Nombre y teléfono son obligatorios'
      );
    }

    try {
      // Crear cliente
      const nuevoCliente = await this.cliente.create(this.formCliente);
      const clienteCreado = nuevoCliente.data || nuevoCliente;
      const clienteId = clienteCreado.documentId || clienteCreado.id;

      // Crear domicilio vinculado
      const domicilioData = { ...this.formDomicilio, cliente: clienteId };
      await this.domicilio.create(domicilioData);

      // Mensaje de éxito
      await this.presentAlert(
        'Éxito',
        '',
        'Cliente y domicilio creados correctamente'
      );

      // Redirigir a asignar servicio

      this.navCtrl.navigateRoot([
        '/asignar-servicio',
        this.formCliente.telefono,
      ]);

      // this.router.navigate(['/asignar-servicio', this.formCliente.telefono]);

      // Reset de formularios y recarga de lista
      this.resetForms();
      this.cargarClientes();
    } catch (err) {
      console.error('Error al crear cliente o domicilio', err);
      this.presentAlert('Error', '', 'No se pudo crear el cliente y domicilio');
    }
  }

  async asignarServicio(cliente: any) {
    // primero asegurarte de tener el cliente listo
    const telefono = cliente.telefono; // o documentId si quieres
    this.navCtrl.navigateRoot(['/asignar-servicio', telefono]);
  }

  async buscarPorTelefono() {
    if (!this.telefonoBusqueda) {
      this.cargarClientes();
      return;
    }

    try {
      const res = await this.cliente.getClienteTelefono(this.telefonoBusqueda);
      this.clientes = Array.isArray(res) ? res : [res];
    } catch (err: any) {
      console.error('Error al buscar cliente', err.response?.data || err);
      this.presentAlert('Error', '', 'No se pudo buscar el cliente');
    }
  }

  async editar(cliente: any) {
    this.editando = cliente;
    const data = cliente.attributes || cliente;
    this.formCliente = {
      nombre: data.nombre || '',
      apellido: data.apellido || '',
      telefono: data.telefono || '',
    };

    // Cargar domicilios
    const clienteId = cliente.documentId || cliente.id;
    const res = await this.domicilio.obtenerPorCliente(clienteId);
    this.domicilios = res.data || res;
    this.domicilioSeleccionado = null;
    this.resetFormDomicilio();
  }

  seleccionarDomicilio(event: any) {
    const seleccionado = event.detail.value;

    if (seleccionado === 'nuevo') {
      // Crear nuevo domicilio
      this.domicilioSeleccionado = null;
      this.formDomicilio = {
        calle: '',
        numero: '',
        colonia: '',
        referencia: '',
        cp: '',
      };
    } else if (seleccionado) {
      // Editar existente
      this.domicilioSeleccionado = seleccionado;
      const data = seleccionado.attributes || seleccionado;
      this.formDomicilio = {
        calle: data.calle || '',
        numero: data.numero || '',
        colonia: data.colonia || '',
        referencia: data.referencia || '',
        cp: data.cp || '',
      };
    }
  }

  compareDomicilios(o1: any, o2: any) {
    return o1 && o2
      ? (o1.id || o1.documentId) === (o2.id || o2.documentId)
      : o1 === o2;
  }

  async guardarDomicilio() {
    if (!this.editando) {
      return this.presentAlert(
        'Error',
        '',
        'Primero selecciona o crea un cliente'
      );
    }

    const clienteId = this.editando.documentId || this.editando.id;

    if (this.domicilioSeleccionado) {
      // Editar existente
      const docId =
        this.domicilioSeleccionado.documentId || this.domicilioSeleccionado.id;
      await this.domicilio.update(docId, this.formDomicilio);
      this.presentAlert('Éxito', '', 'Domicilio actualizado');
    } else {
      // Crear nuevo
      const data = { ...this.formDomicilio, cliente: clienteId };
      await this.domicilio.create(data);
      this.presentAlert('Éxito', '', 'Nuevo domicilio agregado');
    }

    // Recargar domicilios
    const res = await this.domicilio.obtenerPorCliente(clienteId);
    this.domicilios = res.data || res;
    this.domicilioSeleccionado = null;
    this.resetFormDomicilio();
  }

  async eliminarDomicilio() {
    if (!this.domicilioSeleccionado) {
      return this.presentAlert(
        'Error',
        '',
        'Selecciona un domicilio para eliminar'
      );
    }

    const id =
      this.domicilioSeleccionado.documentId || this.domicilioSeleccionado.id;
    await this.domicilio.delete(id);
    this.presentAlert('Éxito', '', 'Domicilio eliminado');

    // Recargar domicilios
    const clienteId = this.editando.documentId || this.editando.id;
    const res = await this.domicilio.obtenerPorCliente(clienteId);
    this.domicilios = res.data || res;

    this.domicilioSeleccionado = null;
    this.resetFormDomicilio();
  }

  async guardarEdicion() {
    if (!this.formCliente.telefono || !this.formCliente.nombre) {
      return this.presentAlert(
        'Error',
        '',
        'Nombre y teléfono son obligatorios'
      );
    }

    const clienteId = this.editando.documentId || this.editando.id;

    try {
      // Actualizar datos del cliente
      await this.cliente.update(clienteId, this.formCliente);

      // Guardar domicilio si hay datos
      const tieneDatosDomicilio =
        this.formDomicilio.calle ||
        this.formDomicilio.numero ||
        this.formDomicilio.colonia ||
        this.formDomicilio.cp ||
        this.formDomicilio.referencia;

      if (tieneDatosDomicilio) {
        if (this.domicilioSeleccionado) {
          // Actualizar domicilio existente
          const docId =
            this.domicilioSeleccionado.documentId ||
            this.domicilioSeleccionado.id;
          await this.domicilio.update(docId, this.formDomicilio);
        } else {
          // Crear nuevo domicilio vinculado al cliente
          await this.domicilio.create({
            ...this.formDomicilio,
            cliente: clienteId,
          });
        }
      }

      this.presentAlert(
        'Éxito',
        '',
        'Cliente y domicilio guardados correctamente'
      );

      // Reset
      this.editando = null;
      this.resetForms();
      this.cargarClientes();
    } catch (err) {
      console.error('Error al guardar cliente y domicilio', err);
      this.presentAlert('Error', '', 'No se pudo guardar cliente y domicilio');
    }
  }

  async eliminar(cliente: any) {
    try {
      const clienteId = cliente.documentId || cliente.id;

      // Borrar todos los domicilios del cliente
      const res = await this.domicilio.obtenerPorCliente(clienteId);
      const domicilios = res.data || res;
      for (const d of domicilios) {
        const docId = d.documentId || d.id;
        await this.domicilio.delete(docId);
      }

      // Borrar cliente
      await this.cliente.delete(clienteId);

      this.presentAlert('Éxito', '', 'Cliente y domicilios eliminados');
      this.cargarClientes();
    } catch (err) {
      console.error('Error al eliminar cliente y domicilios', err);
      this.presentAlert(
        'Error',
        '',
        'No se pudo eliminar el cliente y domicilios'
      );
    }
  }

  cancelarEdicion() {
    this.editando = null;
    this.resetForms();
  }

  resetForms() {
    this.formCliente = { nombre: '', apellido: '', telefono: '' };
    this.resetFormDomicilio();
    this.domicilios = [];
    this.domicilioSeleccionado = null;
  }

  resetFormDomicilio() {
    this.formDomicilio = {
      calle: '',
      numero: '',
      colonia: '',
      referencia: '',
      cp: '',
    };
  }

  irDashboard() {
    setTimeout(() => {
      this.navCtrl.navigateRoot('/dashboard');
    }, 0o10);
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
