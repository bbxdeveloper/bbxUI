import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceiptManagerComponent } from './receipt-manager.component';

describe('ReceiptManagerComponent', () => {
  let component: ReceiptManagerComponent;
  let fixture: ComponentFixture<ReceiptManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReceiptManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReceiptManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
