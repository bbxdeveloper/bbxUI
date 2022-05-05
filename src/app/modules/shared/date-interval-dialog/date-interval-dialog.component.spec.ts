import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DateIntervalDialogComponent } from './date-interval-dialog.component';

describe('DateIntervalDialogComponent', () => {
  let component: DateIntervalDialogComponent;
  let fixture: ComponentFixture<DateIntervalDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DateIntervalDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DateIntervalDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
