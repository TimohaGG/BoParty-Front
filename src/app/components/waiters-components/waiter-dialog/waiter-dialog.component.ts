import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {Staff, StaffCategory, StaffType} from "../../../models/Waiters/Waiter";

export interface WaiterDialogData {
  waiter?: Staff;
  categories?: StaffCategory[];
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
  readonly staffTypes: {value: StaffType; label: string}[] = this.buildStaffTypes();
  name = new FormControl(this.data?.waiter?.name ?? '', [Validators.required]);
  type = new FormControl<StaffType>(this.data?.waiter?.type ?? 'WAITER', {nonNullable: true, validators: [Validators.required]});
  cookPercent = new FormControl(this.data?.waiter?.cookPercent ?? 0, {nonNullable: true, validators: [Validators.min(0)]});

  private buildStaffTypes(): {value: StaffType; label: string}[] {
    const categories = this.data?.categories?.length
      ? this.data.categories
      : [
        {id: null, name: 'Офіціанти', code: 'WAITER'},
        {id: null, name: 'Кухарі', code: 'COOK'},
      ];
    const currentType = this.data?.waiter?.type;
    const hasCurrentType = currentType ? categories.some(item => item.code === currentType) : true;

    return [
      ...categories.map(item => ({value: item.code, label: item.name})),
      ...(!hasCurrentType && currentType ? [{value: currentType, label: currentType}] : []),
    ];
  }

  save(): void {
    const value = this.name.value?.trim();

    if(!value || !this.type.value || this.cookPercent.invalid){
      this.name.markAsTouched();
      this.cookPercent.markAsTouched();
      return;
    }

    this.dialogRef.close({
      name: value,
      type: this.type.value,
      cookPercent: this.type.value === 'COOK' ? Number(this.cookPercent.value) || 0 : 0,
    });
  }
}
