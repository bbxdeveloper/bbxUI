import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IframeViewerDialogComponent } from './iframe-viewer-dialog.component';

describe('IframeViewerDialogComponent', () => {
  let component: IframeViewerDialogComponent;
  let fixture: ComponentFixture<IframeViewerDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IframeViewerDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IframeViewerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
