import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Foliodetails } from './foliodetails';

describe('Foliodetails', () => {
  let component: Foliodetails;
  let fixture: ComponentFixture<Foliodetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Foliodetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Foliodetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
