import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Servicedetails } from './servicedetails';

describe('Servicedetails', () => {
  let component: Servicedetails;
  let fixture: ComponentFixture<Servicedetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicedetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Servicedetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
