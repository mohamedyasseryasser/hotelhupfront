import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Reservationform } from './reservationform';

describe('Reservationform', () => {
  let component: Reservationform;
  let fixture: ComponentFixture<Reservationform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reservationform],
    }).compileComponents();

    fixture = TestBed.createComponent(Reservationform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
