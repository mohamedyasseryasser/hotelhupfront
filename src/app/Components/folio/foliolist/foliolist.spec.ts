import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Foliolist } from './foliolist';

describe('Foliolist', () => {
  let component: Foliolist;
  let fixture: ComponentFixture<Foliolist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Foliolist],
    }).compileComponents();

    fixture = TestBed.createComponent(Foliolist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
