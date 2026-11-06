import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Depositlist } from './depositlist';

describe('Depositlist', () => {
  let component: Depositlist;
  let fixture: ComponentFixture<Depositlist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Depositlist],
    }).compileComponents();

    fixture = TestBed.createComponent(Depositlist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
