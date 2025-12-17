import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth-service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage implements OnInit {
  access_token: string = '';
  constructor(
    private api: AuthService,
    private alert: AlertController,
    private act: ActivatedRoute,
    private router: Router,
    private navCtrl: NavController
  ) {
    console.log(this.act.snapshot.queryParams);
    this.access_token = this.act.snapshot.queryParams['access_token'];
    console.log(this.access_token);
  }

  identifier: string = '';
  password: string = '';

  ngOnInit() {
    //probando la funcion sin formulario
    // this.login()
    console.log('cargando');
    if (this.access_token) {
      this.loginGoogle();
    }
  }

  async loginGoogle() {
    try {
      const res = await this.api.loginGoogle(this.access_token);
      console.log(res);
      this.saveToken(res);
    } catch (error: any) {
      console.log('Hubo un error, intentalo de nuevo');
    }
  }

  async login() {
    try {
      const res = await this.api.login(this.identifier, this.password);
      console.log(res);
      this.saveToken(res);
    } catch (error: any) {
      console.log(error.code); //aqui enviamos un mensaje de error
      if (error.code == 'ERR_BAD_REQUEST') {
        this.presentAlert(
          'Error',
          'Credenciales invalidas',
          'Verifica tus datos'
        );
        return;
      }
      if (error.code == 'ERR_NETWORK') {
        this.presentAlert(
          'Error',
          'No se puede conectar al servidor',
          'Intentalo mas tarde'
        );
        return;
      }
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

  goToForgotPassword() {
    this.navCtrl.navigateRoot(['/forgot']);
  }

  async saveToken(data: any) {
    try {
      localStorage.setItem('token', data.data.jwt);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      this.presentAlert(
        'Éxito',
        'Inicio de sesión correcto',
        'Bienvenido ' + data.data.user.username
      );
      setTimeout(() => {
        this.navCtrl.navigateRoot('/dashboard');
      }, 0o10);
    } catch (error) {
      this.presentAlert(
        'Error',
        'No se pudo guardrar los datos de sesion',
        'Inicia mas tarde'
      );
    }
  }
}
