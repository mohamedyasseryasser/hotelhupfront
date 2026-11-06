import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Roomtypeform } from './roomtypeform';

describe('Roomtypeform', () => {
  let component: Roomtypeform;
  let fixture: ComponentFixture<Roomtypeform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roomtypeform],
    }).compileComponents();

    fixture = TestBed.createComponent(Roomtypeform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
