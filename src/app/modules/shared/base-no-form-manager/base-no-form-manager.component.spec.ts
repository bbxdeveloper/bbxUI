import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Empty } from 'src/assets/model/Empty';

import { BaseNoFormManagerComponent } from './base-no-form-manager.component';

describe('BaseNoFormManagerComponent', () => {
  let component: BaseNoFormManagerComponent<Empty>;
  let fixture: ComponentFixture<BaseNoFormManagerComponent<Empty>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseNoFormManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseNoFormManagerComponent<Empty>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
