import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbxTwoRowComboBoxComponent } from './bbx-two-row-combo-box.component';

describe('BbxTwoRowComboBoxComponent', () => {
  let component: BbxTwoRowComboBoxComponent;
  let fixture: ComponentFixture<BbxTwoRowComboBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BbxTwoRowComboBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BbxTwoRowComboBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
