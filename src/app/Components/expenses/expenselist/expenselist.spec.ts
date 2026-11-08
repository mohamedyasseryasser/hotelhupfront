import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Expenselist } from './expenselist';

describe('Expenselist', () => {
  let component: Expenselist;
  let fixture: ComponentFixture<Expenselist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Expenselist],
    }).compileComponents();

    fixture = TestBed.createComponent(Expenselist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
