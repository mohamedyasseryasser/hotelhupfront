import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Depositdetails } from './depositdetails';

describe('Depositdetails', () => {
  let component: Depositdetails;
  let fixture: ComponentFixture<Depositdetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Depositdetails],
    }).compileComponents();

    fixture = TestBed.createComponent(Depositdetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
