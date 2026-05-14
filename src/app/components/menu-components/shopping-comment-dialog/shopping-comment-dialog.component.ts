import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {FormControl, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';

export interface ShoppingCommentDialogData {
  itemName: string;
  comment: string;
}

@Component({
  selector: 'app-shopping-comment-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
  ],
  templateUrl: './shopping-comment-dialog.component.html',
  styleUrl: './shopping-comment-dialog.component.css'
})
export class ShoppingCommentDialogComponent {
  private dialogRef = inject(MatDialogRef<ShoppingCommentDialogComponent>);
  readonly data = inject<ShoppingCommentDialogData>(MAT_DIALOG_DATA);

  comment = new FormControl(this.data.comment ?? '', [Validators.required]);

  save(): void {
    const value = this.comment.value?.trim();

    if(!value){
      this.comment.markAsTouched();
      return;
    }

    this.dialogRef.close(value);
  }
}
