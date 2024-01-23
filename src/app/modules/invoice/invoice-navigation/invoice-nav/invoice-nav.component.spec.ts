import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoiceNavComponent } from './invoice-nav.component';

describe('InvoiceNavComponent', () => {
  let component: InvoiceNavComponent;
  let fixture: ComponentFixture<InvoiceNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoiceNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoiceNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
