import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private route: ActivatedRoute,
    private authService: AuthService,
    private alert: AlertController,
    private navCtrl: NavController
  ) {}

  ngOnInit() {
    this.code = this.route.snapshot.paramMap.get('code') || '';
    console.log('CODE DESDE URL:', this.code);
  }

  async resetPassword() {
    console.log('PASSWORD:', this.password);
    console.log('PASSWORD CONFIRM:', this.passwordConfirmation);
    console.log('CODE QUE SE ENVÍA:', this.code);

    if (!this.code) {
      console.error('ERROR: No existe código en el URL.');
      alert('Código inválido o enlace caducado.');
      return;
    }

    if (this.password !== this.passwordConfirmation) {
      console.error('Las contraseñas no coinciden');
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const resp = await this.authService.reset({
        code: this.code,
        password: this.password,
        passwordConfirmation: this.passwordConfirmation,
      });

      console.log('RESET SUCCESS:', resp);
      alert('Contraseña actualizada correctamente.');

      this.navCtrl.navigateRoot(['/login']);
    } catch (err) {
      console.error('❌ ERROR AL RESTABLECER:', err);
      alert('Código inválido o enlace caducado.');
    }
  }

  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alert.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['Aceptar'],
      mode: 'ios',
    });

    await alert.present();
  }
}
