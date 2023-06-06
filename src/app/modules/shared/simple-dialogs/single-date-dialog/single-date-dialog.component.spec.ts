import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleDateDialogComponent } from './single-date-dialog.component';

describe('SingleDateDialogComponent', () => {
  let component: SingleDateDialogComponent;
  let fixture: ComponentFixture<SingleDateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SingleDateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
