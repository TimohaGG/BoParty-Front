import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {Waiter} from "../../../models/Waiters/Waiter";

export interface WaiterDialogData {
  waiter?: Waiter;
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
    MatButton
  ],
  templateUrl: './waiter-dialog.component.html',
  styleUrl: './waiter-dialog.component.css'
})
export class WaiterDialogComponent {
  private dialogRef = inject(MatDialogRef<WaiterDialogComponent>);
  readonly data = inject<WaiterDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  isEditMode = !!this.data?.waiter;
  name = new FormControl(this.data?.waiter?.name ?? '', [Validators.required]);

  save(): void {
    const value = this.name.value?.trim();

    if(!value){
      this.name.markAsTouched();
      return;
    }

    this.dialogRef.close(value);
  }
}
