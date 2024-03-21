import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesForNavComponent } from './invoices-for-nav.component';

describe('InvoicesForNavComponent', () => {
  let component: InvoicesForNavComponent;
  let fixture: ComponentFixture<InvoicesForNavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InvoicesForNavComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InvoicesForNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
