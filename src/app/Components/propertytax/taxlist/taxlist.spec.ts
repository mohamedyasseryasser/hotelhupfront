import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Taxlist } from './taxlist';

describe('Taxlist', () => {
  let component: Taxlist;
  let fixture: ComponentFixture<Taxlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Taxlist],
    }).compileComponents();

    fixture = TestBed.createComponent(Taxlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
