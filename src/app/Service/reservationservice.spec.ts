import { TestBed } from '@angular/core/testing';
import { Reservationservice } from './reservationservice';

describe('Reservationservice', () => {
  let service: Reservationservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reservationservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
