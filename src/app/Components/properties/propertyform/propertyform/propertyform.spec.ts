import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Propertyform } from './propertyform';

describe('Propertyform', () => {
  let component: Propertyform;
  let fixture: ComponentFixture<Propertyform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Propertyform],
    }).compileComponents();

    fixture = TestBed.createComponent(Propertyform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
