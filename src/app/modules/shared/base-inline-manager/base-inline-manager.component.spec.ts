import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Empty } from 'src/assets/model/Empty';

import { BaseInlineManagerComponent } from './base-inline-manager.component';

describe('BaseInlineManagerComponent', () => {
  let component: BaseInlineManagerComponent<Empty>;
  let fixture: ComponentFixture<BaseInlineManagerComponent<Empty>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseInlineManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseInlineManagerComponent<Empty>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
