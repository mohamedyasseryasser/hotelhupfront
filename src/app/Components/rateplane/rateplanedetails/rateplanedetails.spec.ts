import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rateplanedetails } from './rateplanedetails';

describe('Rateplanedetails', () => {
  let component: Rateplanedetails;
  let fixture: ComponentFixture<Rateplanedetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rateplanedetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Rateplanedetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
