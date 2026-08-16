import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";

export interface CookingProcessStatsDialogRow {
  staffId: number;
  name: string;
  amount: number;
}

export interface CookingProcessStatsDialogData {
  rows: CookingProcessStatsDialogRow[];
}

type PayoutRowForm = FormGroup<{
  staffId: FormControl<number>;
  name: FormControl<string>;
  amount: FormControl<number>;
}>;

@Component({
  selector: 'app-cooking-process-stats-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput
  ],
  templateUrl: './cooking-process-stats-dialog.component.html',
  styleUrl: './cooking-process-stats-dialog.component.css'
})
export class CookingProcessStatsDialogComponent {
  readonly data = inject<CookingProcessStatsDialogData>(MAT_DIALOG_DATA);
  private readonly dialogRef = inject(MatDialogRef<CookingProcessStatsDialogComponent>);

  readonly form = new FormGroup({
    rows: new FormArray<PayoutRowForm>(this.data.rows.map(item => new FormGroup({
      staffId: new FormControl<number>(item.staffId, {nonNullable: true}),
      name: new FormControl<string>(item.name, {nonNullable: true}),
      amount: new FormControl<number>(this.roundToHundreds(item.amount), {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)]
      }),
    })))
  });

  get rows(): FormArray<PayoutRowForm> {
    return this.form.controls.rows;
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = this.rows.getRawValue().map(item => ({
      staffId: item.staffId,
      name: item.name,
      amount: this.roundToHundreds(item.amount),
    }));

    this.dialogRef.close(payload);
  }

  roundRow(index: number): void {
    const control = this.rows.at(index)?.controls.amount;
    if (!control) {
      return;
    }

    control.setValue(this.roundToHundreds(control.value));
  }

  private roundToHundreds(value: number): number {
    return Math.round((Number(value) || 0) / 100) * 100;
  }
}
