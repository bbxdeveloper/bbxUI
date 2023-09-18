import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbxNumericInputComponent } from './bbx-numeric-input.component';

describe('BbxNumericInputComponent', () => {
  let component: BbxNumericInputComponent;
  let fixture: ComponentFixture<BbxNumericInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BbxNumericInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BbxNumericInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
