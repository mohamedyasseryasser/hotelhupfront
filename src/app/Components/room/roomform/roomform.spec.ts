import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Roomform } from './roomform';

describe('Roomform', () => {
  let component: Roomform;
  let fixture: ComponentFixture<Roomform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Roomform],
    }).compileComponents();

    fixture = TestBed.createComponent(Roomform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
