import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerticalSplitLayoutComponent } from './vertical-split-layout.component';

describe('VerticalSplitLayoutComponent', () => {
  let component: VerticalSplitLayoutComponent;
  let fixture: ComponentFixture<VerticalSplitLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VerticalSplitLayoutComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VerticalSplitLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
