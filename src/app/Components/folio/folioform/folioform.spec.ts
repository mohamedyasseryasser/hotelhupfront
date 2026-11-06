import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Folioform } from './folioform';

describe('Folioform', () => {
  let component: Folioform;
  let fixture: ComponentFixture<Folioform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Folioform],
    }).compileComponents();

    fixture = TestBed.createComponent(Folioform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
