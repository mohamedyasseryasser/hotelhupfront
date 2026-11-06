import { TestBed } from '@angular/core/testing';
import { Permissionservice } from './permissionservice';

describe('Permissionservice', () => {
  let service: Permissionservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Permissionservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
