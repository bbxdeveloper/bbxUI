import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SummaryInvoiceComponent } from './summary-invoice.component';

describe('SummaryInvoiceComponent', () => {
  let component: SummaryInvoiceComponent;
  let fixture: ComponentFixture<SummaryInvoiceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SummaryInvoiceComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SummaryInvoiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
