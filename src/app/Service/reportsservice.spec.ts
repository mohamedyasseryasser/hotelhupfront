import { TestBed } from '@angular/core/testing';
import { Reportsservice } from './reportsservice';

describe('Reportsservice', () => {
  let service: Reportsservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Reportsservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
