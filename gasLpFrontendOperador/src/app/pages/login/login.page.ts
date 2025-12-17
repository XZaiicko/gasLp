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
  identifier: string = '';
  password: string = '';

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

  ngOnInit() {
    //probando la funcion sin formulario
    // this.login()
    console.log('cargando');
    if (this.access_token) {
      this.loginGoogle();
    }
  }

  // Login Google usando code de OAuth2
  async loginGoogle() {
    try {
      const res = await this.api.loginGoogle(this.access_token);
      console.log(res);
      this.saveToken(res);
    } catch (error: any) {
      console.log('Hubo un error, intentalo de nuevo');
    }
  }

  // Login normal
  async login() {
    try {
      const res = await this.api.login(this.identifier, this.password);
      console.log('Respuesta login normal:', res);
      this.saveToken(res);
    } catch (error: any) {
      console.error('Error en login normal:', error);
      if (error.code === 'ERR_BAD_REQUEST') {
        this.presentAlert(
          'Error',
          'Credenciales inválidas',
          'Verifica tus datos'
        );
      } else if (error.code === 'ERR_NETWORK') {
        this.presentAlert(
          'Error',
          'No se puede conectar al servidor',
          'Intenta más tarde'
        );
      }
    }
  }

  // Guardar token y redirigir

  // async saveToken(data: any) {
  //   try {
  //     localStorage.setItem('token', data.data.jwt);
  //     localStorage.setItem('user', JSON.stringify(data.data.user));
  //     console.log('Token guardado:', localStorage.getItem('token'));

  //     await this.presentAlert(
  //       'Éxito',
  //       'Inicio de sesión correcto',
  //       'Bienvenido ' + data.data.user.username
  //     );

  //     // Navegar después de mostrar alerta
  //     this.navCtrl.navigateRoot('/dashboard');
  //   } catch (error) {
  //     this.presentAlert(
  //       'Error',
  //       'No se pudo guardar los datos de sesión',
  //       'Inicia más tarde'
  //     );
  //   }
  // }

  // Guardar token y redirigir
  async saveToken(data: any) {
    try {
      // Guardar JWT y usuario
      localStorage.setItem('token', data.data.jwt);
      localStorage.setItem('user', JSON.stringify(data.data.user));

      // Obtener el personal asociado al usuario con su ruta
      const personalResp: any = await this.api.getPersonalByUserId(
        data.data.user.id
      );
      console.log('Personal completo:', personalResp.data); // <-- para depuración

      const personal = personalResp.data?.[0]; // tomar el primer registro si existe

      const operador = {
        id: data.data.user.id,
        nombre: data.data.user.username,
        rutaAsignada: personal?.ruta?.documentId || null, // acceder correctamente a la ruta
      };

      // Guardar operador en localStorage
      localStorage.setItem('operador', JSON.stringify(operador));
      console.log('Operador guardado:', localStorage.getItem('operador'));

      // Mostrar alerta de éxito
      await this.presentAlert(
        'Éxito',
        'Inicio de sesión correcto',
        'Bienvenido ' + data.data.user.username
      );

      // Redirigir al dashboard
      this.navCtrl.navigateRoot('/dashboard');
    } catch (error) {
      console.error('Error guardando token y operador:', error);
      await this.presentAlert(
        'Error',
        'No se pudo guardar los datos de sesión',
        'Inicia más tarde'
      );
    }
  }

  // Ir a página de forgot password
  goToForgotPassword() {
    this.navCtrl.navigateRoot(['/forgot']);
  }

  // Alerta
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
