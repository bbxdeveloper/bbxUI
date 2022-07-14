import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseOfferEditorComponent } from './base-offer-editor.component';

describe('BaseOfferEditorComponent', () => {
  let component: BaseOfferEditorComponent;
  let fixture: ComponentFixture<BaseOfferEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseOfferEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseOfferEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
