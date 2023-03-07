import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FKeyButtonsRowComponent } from './fkey-buttons-row.component';

describe('FkeyButtonsRowComponent', () => {
  let component: FKeyButtonsRowComponent;
  let fixture: ComponentFixture<FKeyButtonsRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FKeyButtonsRowComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FKeyButtonsRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
