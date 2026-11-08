import { TestBed } from '@angular/core/testing';
import { Expensesservices } from './expensesservices';

describe('Expensesservices', () => {
  let service: Expensesservices;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Expensesservices);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
