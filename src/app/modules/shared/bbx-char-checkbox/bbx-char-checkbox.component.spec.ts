import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbxCharCheckboxComponent } from './bbx-char-checkbox.component';

describe('BbxCharCheckboxComponent', () => {
  let component: BbxCharCheckboxComponent;
  let fixture: ComponentFixture<BbxCharCheckboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BbxCharCheckboxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BbxCharCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
