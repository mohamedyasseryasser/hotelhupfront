import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Guestform } from './guestform';

describe('Guestform', () => {
  let component: Guestform;
  let fixture: ComponentFixture<Guestform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Guestform],
    }).compileComponents();

    fixture = TestBed.createComponent(Guestform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
