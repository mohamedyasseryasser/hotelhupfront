import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Roomtypelistimplements } from './roomtypelist';

describe('Roomtypelist', () => {
  let component: Roomtypelistimplements;
  let fixture: ComponentFixture<Roomtypelistimplements>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roomtypelistimplements],
    }).compileComponents();

    fixture = TestBed.createComponent(Roomtypelistimplements);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
