import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceItemsDialogComponent } from './invoice-items-dialog.component';

describe('InvoiceItemsDialogComponent', () => {
  let component: InvoiceItemsDialogComponent;
  let fixture: ComponentFixture<InvoiceItemsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceItemsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceItemsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
