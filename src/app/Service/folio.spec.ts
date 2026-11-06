import { TestBed } from '@angular/core/testing';
import { Folio } from './folio';

describe('Folio', () => {
  let service: Folio;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Folio);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
