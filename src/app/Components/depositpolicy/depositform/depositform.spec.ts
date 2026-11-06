import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Depositform } from './depositform';

describe('Depositform', () => {
  let component: Depositform;
  let fixture: ComponentFixture<Depositform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Depositform],
    }).compileComponents();

    fixture = TestBed.createComponent(Depositform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
