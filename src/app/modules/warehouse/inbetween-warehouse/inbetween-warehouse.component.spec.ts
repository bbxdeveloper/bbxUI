import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InbetweenWarehouseComponent } from './inbetween-warehouse.component';

describe('InbetweenWarehouseComponent', () => {
  let component: InbetweenWarehouseComponent;
  let fixture: ComponentFixture<InbetweenWarehouseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ InbetweenWarehouseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(InbetweenWarehouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
