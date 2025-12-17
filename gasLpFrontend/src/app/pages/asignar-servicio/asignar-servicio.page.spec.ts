import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AsignarServicioPage } from './asignar-servicio.page';

describe('AsignarServicioPage', () => {
  let component: AsignarServicioPage;
  let fixture: ComponentFixture<AsignarServicioPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(AsignarServicioPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
