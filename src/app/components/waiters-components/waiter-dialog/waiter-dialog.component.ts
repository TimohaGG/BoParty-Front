import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {Staff, StaffType} from "../../../models/Waiters/Waiter";

export interface WaiterDialogData {
  waiter?: Staff;
}

@Component({
  selector: 'app-waiter-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatSelect,
    MatOption
  ],
  templateUrl: './waiter-dialog.component.html',
  styleUrl: './waiter-dialog.component.css'
})
export class WaiterDialogComponent {
  private dialogRef = inject(MatDialogRef<WaiterDialogComponent>);
  readonly data = inject<WaiterDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  isEditMode = !!this.data?.waiter;
  readonly staffTypes: {value: StaffType; label: string}[] = [
    {value: 'WAITER', label: 'Офіціант'},
    {value: 'COOK', label: 'Кухар'},
  ];
  name = new FormControl(this.data?.waiter?.name ?? '', [Validators.required]);
  type = new FormControl<StaffType>(this.data?.waiter?.type ?? 'WAITER', {nonNullable: true, validators: [Validators.required]});

  save(): void {
    const value = this.name.value?.trim();

    if(!value || !this.type.value){
      this.name.markAsTouched();
      return;
    }

    this.dialogRef.close({
      name: value,
      type: this.type.value,
    });
  }
}
