import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cancellationpolicydetails } from './cancellationpolicydetails';

describe('Cancellationpolicydetails', () => {
  let component: Cancellationpolicydetails;
  let fixture: ComponentFixture<Cancellationpolicydetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cancellationpolicydetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Cancellationpolicydetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
