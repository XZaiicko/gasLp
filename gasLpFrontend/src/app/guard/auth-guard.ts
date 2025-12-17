import { CanActivateFn } from '@angular/router';
import axios from 'axios';
import { environment } from 'src/environments/environment.prod';

export const authGuard: CanActivateFn = async (route, state) => {
  const token = localStorage.getItem('token');
  let url = environment.apiUrl;

  console.log('Token guardado:', localStorage.getItem('token'));

  if (!token) {
    window.alert('Debes iniciar sesion para continuar');
    window.location.href = '/login';
    return false;
  } else {
    try {
      const user = await axios.get(url + '/users/me?populate=*', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (user.data.role.type == 'operador') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.alert(
          'Tu token se ha caducado, Debes iniciar sesión para continuar'
        );
        window.location.href = '/login';
        return false;
      }
      console.log(user);
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
  }
  window.location.href = '/login';
  return false;
};
