import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RadioChoiceDialogComponent } from './radio-choice-dialog.component';

describe('RadioChoiceDialogComponent', () => {
  let component: RadioChoiceDialogComponent;
  let fixture: ComponentFixture<RadioChoiceDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RadioChoiceDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RadioChoiceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
