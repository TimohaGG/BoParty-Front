import {Component, inject} from '@angular/core';
import {FormControl, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";

@Component({
  selector: 'app-staff-category-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButton,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatFormField,
    MatInput,
    MatLabel
  ],
  templateUrl: './staff-category-dialog.component.html',
  styleUrl: './staff-category-dialog.component.css'
})
export class StaffCategoryDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<StaffCategoryDialogComponent>);
  readonly name = new FormControl('', {nonNullable: true, validators: [Validators.required]});

  save(): void {
    const value = this.name.value.trim();
    if (!value) {
      this.name.markAsTouched();
      return;
    }

    this.dialogRef.close(value);
  }
}
