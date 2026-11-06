import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rateplaneform } from './rateplaneform';

describe('Rateplaneform', () => {
  let component: Rateplaneform;
  let fixture: ComponentFixture<Rateplaneform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rateplaneform],
    }).compileComponents();

    fixture = TestBed.createComponent(Rateplaneform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
