import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WarehouseDocumentSideBarFormComponent } from './warehouse-document-side-bar-form.component';

describe('WarehouseDocumentSideBarFormComponent', () => {
  let component: WarehouseDocumentSideBarFormComponent;
  let fixture: ComponentFixture<WarehouseDocumentSideBarFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WarehouseDocumentSideBarFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WarehouseDocumentSideBarFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
