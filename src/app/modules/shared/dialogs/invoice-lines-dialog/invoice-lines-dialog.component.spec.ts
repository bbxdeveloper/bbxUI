import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceLinesDialogComponent } from './invoice-lines-dialog.component';

describe('InvoiceLinesDialogComponent', () => {
  let component: InvoiceLinesDialogComponent;
  let fixture: ComponentFixture<InvoiceLinesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InvoiceLinesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceLinesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
