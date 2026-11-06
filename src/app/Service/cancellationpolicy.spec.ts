import { TestBed } from '@angular/core/testing';
import { Cancellationpolicy } from './cancellationpolicy';

describe('Cancellationpolicy', () => {
  let service: Cancellationpolicy;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Cancellationpolicy);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
