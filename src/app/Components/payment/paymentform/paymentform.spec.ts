import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paymentform } from './paymentform';

describe('Paymentform', () => {
  let component: Paymentform;
  let fixture: ComponentFixture<Paymentform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paymentform],
    }).compileComponents();

    fixture = TestBed.createComponent(Paymentform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
