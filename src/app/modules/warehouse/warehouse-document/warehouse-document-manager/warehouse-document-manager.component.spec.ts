import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseDocumentManagerComponent } from './warehouse-document-manager.component';

describe('WarehouseDocumentManagerComponent', () => {
  let component: WarehouseDocumentManagerComponent;
  let fixture: ComponentFixture<WarehouseDocumentManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseDocumentManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseDocumentManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
