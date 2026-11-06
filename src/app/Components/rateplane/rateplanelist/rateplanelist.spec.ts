import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rateplanelist } from './rateplanelist';

describe('Rateplanelist', () => {
  let component: Rateplanelist;
  let fixture: ComponentFixture<Rateplanelist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rateplanelist],
    }).compileComponents();

    fixture = TestBed.createComponent(Rateplanelist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
