import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HozirontalSplitLayoutComponent } from './hozirontal-split-layout.component';

describe('HozirontalSplitLayoutComponent', () => {
  let component: HozirontalSplitLayoutComponent;
  let fixture: ComponentFixture<HozirontalSplitLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HozirontalSplitLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HozirontalSplitLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
