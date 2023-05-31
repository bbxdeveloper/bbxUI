import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneNumberInputDialogComponent } from './one-number-input-dialog.component';

describe('OneNumberInputDialogComponent', () => {
  let component: OneNumberInputDialogComponent;
  let fixture: ComponentFixture<OneNumberInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneNumberInputDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneNumberInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
