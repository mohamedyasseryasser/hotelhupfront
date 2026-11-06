import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Serviceform } from './serviceform';

describe('Serviceform', () => {
  let component: Serviceform;
  let fixture: ComponentFixture<Serviceform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Serviceform],
    }).compileComponents();

    fixture = TestBed.createComponent(Serviceform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
