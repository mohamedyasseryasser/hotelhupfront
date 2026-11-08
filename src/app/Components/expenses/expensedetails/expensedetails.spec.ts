import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Expensedetails } from './expensedetails';

describe('Expensedetails', () => {
  let component: Expensedetails;
  let fixture: ComponentFixture<Expensedetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expensedetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Expensedetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
