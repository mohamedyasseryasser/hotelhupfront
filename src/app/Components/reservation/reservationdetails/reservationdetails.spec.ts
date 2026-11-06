import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Reservationdetails } from './reservationdetails';

describe('Reservationdetails', () => {
  let component: Reservationdetails;
  let fixture: ComponentFixture<Reservationdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Reservationdetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Reservationdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
