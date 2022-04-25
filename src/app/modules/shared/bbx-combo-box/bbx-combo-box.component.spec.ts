import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbxComboBoxComponent } from './bbx-combo-box.component';

describe('BbxComboBoxComponent', () => {
  let component: BbxComboBoxComponent;
  let fixture: ComponentFixture<BbxComboBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BbxComboBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BbxComboBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
