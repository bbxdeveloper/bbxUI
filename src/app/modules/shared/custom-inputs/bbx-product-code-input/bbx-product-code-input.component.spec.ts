import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BbxProductCodeInputComponent } from './bbx-product-code-input.component';

describe('BbxProductCodeInputComponent', () => {
  let component: BbxProductCodeInputComponent;
  let fixture: ComponentFixture<BbxProductCodeInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BbxProductCodeInputComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BbxProductCodeInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
