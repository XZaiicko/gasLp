import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { authGuard } from './guard/auth-guard';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () =>
      import('./home/home.module').then((m) => m.HomePageModule),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadChildren: () =>
      import('./pages/login/login.module').then((m) => m.LoginPageModule),
  },
  {
    path: 'forgot',
    loadChildren: () =>
      import('./pages/login/forgot/forgot.module').then(
        (m) => m.ForgotPageModule
      ),
  },
  {
    path: 'reset/:code',
    loadChildren: () =>
      import('./pages/login/reset-password/reset-password.module').then(
        (m) => m.ResetPasswordPageModule
      ),
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./pages/dashboard/dashboard.module').then(
        (m) => m.DashboardPageModule
      ),
    canActivate: [authGuard],
  },
  {
    path: 'cliente',
    loadChildren: () =>
      import('./pages/cliente/cliente.module').then((m) => m.ClientePageModule),
  },
  {
    path: 'asignar-servicio/:id',
    loadChildren: () =>
      import('./pages/asignar-servicio/asignar-servicio.module').then(
        (m) => m.AsignarServicioPageModule
      ),
  },
  {
    path: 'reportes',
    loadChildren: () => import('./pages/reportes/reportes.module').then( m => m.ReportesPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
