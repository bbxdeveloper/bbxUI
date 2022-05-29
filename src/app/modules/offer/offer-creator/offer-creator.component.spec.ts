import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfferCreatorComponent } from './offer-editor.component';

describe('OfferEditorComponent', () => {
  let component: OfferCreatorComponent;
  let fixture: ComponentFixture<OfferCreatorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OfferCreatorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OfferCreatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
