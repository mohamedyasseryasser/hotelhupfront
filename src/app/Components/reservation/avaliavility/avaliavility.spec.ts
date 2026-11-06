import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Avaliavility } from './avaliavility';

describe('Avaliavility', () => {
  let component: Avaliavility;
  let fixture: ComponentFixture<Avaliavility>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avaliavility],
    }).compileComponents();

    fixture = TestBed.createComponent(Avaliavility);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
