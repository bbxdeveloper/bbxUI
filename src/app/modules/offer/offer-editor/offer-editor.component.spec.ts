import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferEditorComponent } from './offer-editor.component';

describe('OfferEditorComponent', () => {
  let component: OfferEditorComponent;
  let fixture: ComponentFixture<OfferEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
