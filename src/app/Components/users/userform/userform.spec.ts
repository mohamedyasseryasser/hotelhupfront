import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Userform } from './userform';

describe('Userform', () => {
  let component: Userform;
  let fixture: ComponentFixture<Userform>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Userform],
    }).compileComponents();

    fixture = TestBed.createComponent(Userform);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
