import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cancellationpolicyform } from './cancellationpolicyform';

describe('Cancellationpolicyform', () => {
  let component: Cancellationpolicyform;
  let fixture: ComponentFixture<Cancellationpolicyform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cancellationpolicyform],
    }).compileComponents();

    fixture = TestBed.createComponent(Cancellationpolicyform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
