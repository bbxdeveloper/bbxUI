import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseDocumentFilterFormComponent } from './warehouse-document-filter-form.component';

describe('WarehouseDocumentFilterFormComponent', () => {
  let component: WarehouseDocumentFilterFormComponent;
  let fixture: ComponentFixture<WarehouseDocumentFilterFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseDocumentFilterFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseDocumentFilterFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
