import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Taxform } from './taxform';

describe('Taxform', () => {
  let component: Taxform;
  let fixture: ComponentFixture<Taxform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Taxform],
    }).compileComponents();

    fixture = TestBed.createComponent(Taxform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
