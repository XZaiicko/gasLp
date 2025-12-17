import { TestBed } from '@angular/core/testing';

import { Domicilio } from './domicilio';

describe('Domicilio', () => {
  let service: Domicilio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Domicilio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
