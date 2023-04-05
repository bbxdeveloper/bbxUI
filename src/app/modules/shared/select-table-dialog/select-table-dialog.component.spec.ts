import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Empty } from 'src/assets/model/Empty';

import { SelectTableDialogComponent } from './select-table-dialog.component';

describe('SelectTableDialogComponent', () => {
  let component: SelectTableDialogComponent<Empty>;
  let fixture: ComponentFixture<SelectTableDialogComponent<Empty>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SelectTableDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectTableDialogComponent<Empty>);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
