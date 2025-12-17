import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AsignarServicioPage } from './asignar-servicio.page';

const routes: Routes = [
  {
    path: '',
    component: AsignarServicioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AsignarServicioPageRoutingModule {}
