import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Expenseform } from './expenseform';

describe('Expenseform', () => {
  let component: Expenseform;
  let fixture: ComponentFixture<Expenseform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expenseform],
    }).compileComponents();

    fixture = TestBed.createComponent(Expenseform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
