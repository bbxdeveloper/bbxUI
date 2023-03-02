import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Empty } from 'src/assets/model/Empty';

import { BaseManagerComponent } from './base-manager.component';

describe('BaseManagerComponent', () => {
  let component: BaseManagerComponent<Empty>;
  let fixture: ComponentFixture<BaseManagerComponent<Empty>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BaseManagerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BaseManagerComponent<Empty>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
