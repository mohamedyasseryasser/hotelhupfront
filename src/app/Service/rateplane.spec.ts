import { TestBed } from '@angular/core/testing';
import { Rateplane } from './rateplane';

describe('Rateplane', () => {
  let service: Rateplane;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rateplane);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
