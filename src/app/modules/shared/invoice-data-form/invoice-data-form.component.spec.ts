import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceDataFormComponent } from './invoice-data-form.component';

describe('InvoiceDataFormComponent', () => {
  let component: InvoiceDataFormComponent;
  let fixture: ComponentFixture<InvoiceDataFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceDataFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceDataFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
