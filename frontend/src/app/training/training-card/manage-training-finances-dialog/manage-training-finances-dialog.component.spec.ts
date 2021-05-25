import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTrainingFinancesDialogComponent } from './manage-training-finances-dialog.component';

describe('ManageTrainingFinancesDialogComponent', () => {
  let component: ManageTrainingFinancesDialogComponent;
  let fixture: ComponentFixture<ManageTrainingFinancesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ManageTrainingFinancesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTrainingFinancesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
