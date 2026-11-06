import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Paymentlist } from './paymentlist';

describe('Paymentlist', () => {
  let component: Paymentlist;
  let fixture: ComponentFixture<Paymentlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Paymentlist],
    }).compileComponents();

    fixture = TestBed.createComponent(Paymentlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
