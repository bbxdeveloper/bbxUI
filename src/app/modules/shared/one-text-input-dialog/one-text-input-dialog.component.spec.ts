import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneTextInputDialogComponent } from './one-text-input-dialog.component';

describe('OneTextInputDialogComponent', () => {
  let component: OneTextInputDialogComponent;
  let fixture: ComponentFixture<OneTextInputDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneTextInputDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneTextInputDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
