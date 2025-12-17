import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: false,
})
export class ResetPasswordPage implements OnInit {
  code: string = '';
  password: string = '';
  passwordConfirmation: string = '';

  constructor(
    private api: AuthService,
    private act: ActivatedRoute,
    private alert: AlertController,
    private router: Router,
    private navCtrl: NavController
  ) {
    // Obtenemos el código desde la URL
    this.code = this.act.snapshot.paramMap.get('code') || '';
    console.log('Código recibido:', this.code);
  }

  ngOnInit() {}

  async resetPassword() {
    console.log('Datos enviados al reset-password:', {
      code: this.code,
      password: this.password,
      passwordConfirmation: this.passwordConfirmation,
    });

    try {
      const res = await this.api.reset(
        this.code,
        this.password,
        this.passwordConfirmation
      );

      console.log('Respuesta del servidor:', res);
      this.presentAlert('Éxito', '', 'Contraseña restablecida correctamente');

      // Redirigir al login después del cambio de contraseña
      this.navCtrl.navigateRoot(['/login']);
    } catch (error: any) {
      console.log('Error en reset-password:', error);

      // Errores específicos de Strapi
      if (error.response?.data?.error?.message === 'Incorrect code provided') {
        this.presentAlert('Error', 'Código inválido', 'Verifica el enlace');
        return;
      }

      if (error.response?.data?.error?.message === 'code is a required field') {
        this.presentAlert('Error', 'Código requerido', 'Verifica el enlace');
        return;
      }

      if (error.code === 'ERR_NETWORK') {
        this.presentAlert(
          'Error',
          'No se puede conectar al servidor',
          'Intenta más tarde'
        );
        return;
      }

      if (error.code === 'ERR_BAD_REQUEST') {
        this.presentAlert(
          'Error',
          '',
          'Verifica tus contraseñas (deben coincidir y cumplir requisitos)'
        );
        return;
      }

      // Cualquier otro error
      this.presentAlert(
        'Error',
        'Error desconocido',
        'Revisa la consola para más información'
      );
    }
  }

  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alert.create({
      header,
      subHeader,
      message,
      buttons: ['Aceptar'],
      mode: 'ios',
    });

    await alert.present();
  }
}
