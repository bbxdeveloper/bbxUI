import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GetPendingDeliveryNotesDialogComponent } from './get-pending-delivery-notes-dialog.component';

describe('GetPendingDeliveryNotesDialogComponent', () => {
  let component: GetPendingDeliveryNotesDialogComponent;
  let fixture: ComponentFixture<GetPendingDeliveryNotesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GetPendingDeliveryNotesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GetPendingDeliveryNotesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
