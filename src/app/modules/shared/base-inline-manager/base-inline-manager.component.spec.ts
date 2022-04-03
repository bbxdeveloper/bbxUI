import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BaseInlineManagerComponent } from './base-inline-manager.component';

describe('BaseInlineManagerComponent', () => {
  let component: BaseInlineManagerComponent;
  let fixture: ComponentFixture<BaseInlineManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseInlineManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseInlineManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
