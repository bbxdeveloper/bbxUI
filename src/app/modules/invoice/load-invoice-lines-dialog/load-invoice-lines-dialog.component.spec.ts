import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadInvoiceLinesDialogComponent } from './load-invoice-lines-dialog.component';

describe('LoadInvoiceLinesDialogComponent', () => {
  let component: LoadInvoiceLinesDialogComponent;
  let fixture: ComponentFixture<LoadInvoiceLinesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoadInvoiceLinesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadInvoiceLinesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
