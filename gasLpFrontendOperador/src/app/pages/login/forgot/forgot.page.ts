import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-forgot',
  templateUrl: './forgot.page.html',
  styleUrls: ['./forgot.page.scss'],
  standalone: false,
})
export class ForgotPage implements OnInit {
  email: string = '';

  constructor(
    private api: AuthService,
    private alert: AlertController,
    private router: Router
  ) {}

  ngOnInit() {}
  async forgot() {
    try {
      const res = await this.api.forgot(this.email); // tu API devuelve un código
      console.log(res);
      this.presentAlert(
        'Éxito',
        '',
        'Revisa tu correo para restablecer tu contraseña'
      );

      // Supongamos que tu API devuelve un token/código
      const code = res.data.code;
      setTimeout(() => {
        window.open('https://mail.google.com', '_blank');
      }, 3000);
    } catch (error: any) {
      // manejo de errores
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
