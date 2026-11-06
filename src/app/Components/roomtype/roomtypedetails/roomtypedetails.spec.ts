import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Roomtypedetails } from './roomtypedetails';

describe('Roomtypedetails', () => {
  let component: Roomtypedetails;
  let fixture: ComponentFixture<Roomtypedetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roomtypedetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Roomtypedetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
