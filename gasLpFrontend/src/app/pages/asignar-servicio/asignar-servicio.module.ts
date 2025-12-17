import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { AsignarServicioPageRoutingModule } from './asignar-servicio-routing.module';

import { AsignarServicioPage } from './asignar-servicio.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AsignarServicioPageRoutingModule
  ],
  declarations: [AsignarServicioPage]
})
export class AsignarServicioPageModule {}
