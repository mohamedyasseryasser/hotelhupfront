import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Propertyseeting } from './propertyseeting';

describe('Propertyseeting', () => {
  let component: Propertyseeting;
  let fixture: ComponentFixture<Propertyseeting>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Propertyseeting],
    }).compileComponents();

    fixture = TestBed.createComponent(Propertyseeting);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
