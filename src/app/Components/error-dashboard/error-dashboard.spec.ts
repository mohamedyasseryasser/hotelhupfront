import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ErrorDashboard } from './error-dashboard';

describe('ErrorDashboard', () => {
  let component: ErrorDashboard;
  let fixture: ComponentFixture<ErrorDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErrorDashboard],
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
