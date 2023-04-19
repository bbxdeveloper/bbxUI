import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceStyleLabelColumnComponent } from './invoice-style-label-column.component';

describe('InvoiceStyleLabelColumnComponent', () => {
  let component: InvoiceStyleLabelColumnComponent;
  let fixture: ComponentFixture<InvoiceStyleLabelColumnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceStyleLabelColumnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceStyleLabelColumnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
