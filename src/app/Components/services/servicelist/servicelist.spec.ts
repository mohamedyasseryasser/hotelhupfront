import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Servicelist } from './servicelist';

describe('Servicelist', () => {
  let component: Servicelist;
  let fixture: ComponentFixture<Servicelist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Servicelist],
    }).compileComponents();

    fixture = TestBed.createComponent(Servicelist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
