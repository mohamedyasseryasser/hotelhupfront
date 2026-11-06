import { TestBed } from '@angular/core/testing';
import { Propertyservice } from './propertyservice';

describe('Propertyservice', () => {
  let service: Propertyservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Propertyservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
