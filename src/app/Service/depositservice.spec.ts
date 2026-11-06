import { TestBed } from '@angular/core/testing';
import { Depositservice } from './depositservice';

describe('Depositservice', () => {
  let service: Depositservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Depositservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
