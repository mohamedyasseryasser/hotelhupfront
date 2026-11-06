import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Guestdetails } from './guestdetails';

describe('Guestdetails', () => {
  let component: Guestdetails;
  let fixture: ComponentFixture<Guestdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guestdetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Guestdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
