import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseDocumentDetailsDialogComponent } from './warehouse-document-details-dialog.component';

describe('WarehouseDocumentDetailsDialogComponent', () => {
  let component: WarehouseDocumentDetailsDialogComponent;
  let fixture: ComponentFixture<WarehouseDocumentDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseDocumentDetailsDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseDocumentDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
