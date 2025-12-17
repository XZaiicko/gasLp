import { CanActivateFn } from '@angular/router';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

export const authGuard: CanActivateFn = async (route, state) => {
  const token = localStorage.getItem('token');
  let url = environment.apiUrl;

  if (!token) {
    window.alert('Debes iniciar sesion para continuar');
    window.location.href = '/login';
    return false;
  }

  try {
    const user = await axios.get(url + '/users/me?populate=*', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('USER DATA STRAPI:', user.data);

    // SOLO OPERADORES PUEDEN ENTRAR
    if (user.data.role.type !== 'operador') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.alert('No tienes permisos para acceder');
      window.location.href = '/login';
      return false;
    }

    console.log('Usuario validado:', user.data);
    return true;
  } catch (error) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log(error);
    window.alert(
      'Tu token se ha caducado, Debes iniciar sesión para continuar'
    );
    window.location.href = '/login';
    return false;
  }
};
