import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrationRoleDialogComponent } from './registration-role-dialog.component';

describe('RegistrationRoleDialogComponent', () => {
  let component: RegistrationRoleDialogComponent;
  let fixture: ComponentFixture<RegistrationRoleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RegistrationRoleDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(RegistrationRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
