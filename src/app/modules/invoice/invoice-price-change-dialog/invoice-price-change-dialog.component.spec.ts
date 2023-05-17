import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicePriceChangeDialogComponent } from './invoice-price-change-dialog.component';

describe('InvoicePriceChangeDialogComponent', () => {
  let component: InvoicePriceChangeDialogComponent;
  let fixture: ComponentFixture<InvoicePriceChangeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicePriceChangeDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicePriceChangeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
