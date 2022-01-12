import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FkeyButtonsRowComponent } from './fkey-buttons-row.component';

describe('FkeyButtonsRowComponent', () => {
  let component: FkeyButtonsRowComponent;
  let fixture: ComponentFixture<FkeyButtonsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FkeyButtonsRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FkeyButtonsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
