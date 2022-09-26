import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneButtonMessageDialogComponent } from './one-button-message-dialog.component';

describe('OneButtonMessageDialogComponent', () => {
  let component: OneButtonMessageDialogComponent;
  let fixture: ComponentFixture<OneButtonMessageDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OneButtonMessageDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OneButtonMessageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
