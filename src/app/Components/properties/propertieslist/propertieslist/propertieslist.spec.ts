import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Propertieslist } from './propertieslist';

describe('Propertieslist', () => {
  let component: Propertieslist;
  let fixture: ComponentFixture<Propertieslist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Propertieslist],
    }).compileComponents();

    fixture = TestBed.createComponent(Propertieslist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
