import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

export interface PasteMenuPositionsConfirmDialogData {
  positionsCount: number;
}

@Component({
  selector: 'app-paste-menu-positions-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton
  ],
  template: `
    <div class="bo-dialog">
      <header class="bo-dialog-header">
        <h2>Підтвердити вставку</h2>
        <p>Вставити {{data.positionsCount}} позицій у це замовлення?</p>
      </header>

      <mat-dialog-content class="bo-dialog-content"></mat-dialog-content>

      <mat-dialog-actions class="bo-dialog-actions">
        <button mat-button mat-dialog-close>Скасувати</button>
        <button mat-flat-button color="accent" (click)="confirm()">Вставити</button>
      </mat-dialog-actions>
    </div>
  `,
})
export class PasteMenuPositionsConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PasteMenuPositionsConfirmDialogComponent>);
  readonly data = inject<PasteMenuPositionsConfirmDialogData>(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }
}
