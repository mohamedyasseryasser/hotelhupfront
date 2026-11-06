import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cancellationpolicylist } from './cancellationpolicylist';

describe('Cancellationpolicylist', () => {
  let component: Cancellationpolicylist;
  let fixture: ComponentFixture<Cancellationpolicylist>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cancellationpolicylist],
    }).compileComponents();

    fixture = TestBed.createComponent(Cancellationpolicylist);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
