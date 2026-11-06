import { TestBed } from '@angular/core/testing';
import { Roomtypeservice } from './roomtypeservice';

describe('Roomtypeservice', () => {
  let service: Roomtypeservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Roomtypeservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
