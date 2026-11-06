import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Taxdetails } from './taxdetails';

describe('Taxdetails', () => {
  let component: Taxdetails;
  let fixture: ComponentFixture<Taxdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Taxdetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Taxdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
