import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbxInlineTableComboBoxComponent } from './bbx-inline-table-combo-box.component';

describe('BbxInlineTableComboBoxComponent', () => {
  let component: BbxInlineTableComboBoxComponent;
  let fixture: ComponentFixture<BbxInlineTableComboBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BbxInlineTableComboBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BbxInlineTableComboBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
