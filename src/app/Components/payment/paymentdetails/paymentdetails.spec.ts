import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paymentdetails } from './paymentdetails';

describe('Paymentdetails', () => {
  let component: Paymentdetails;
  let fixture: ComponentFixture<Paymentdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paymentdetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Paymentdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
