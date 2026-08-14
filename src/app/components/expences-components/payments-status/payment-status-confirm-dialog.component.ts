import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";

export interface PaymentStatusConfirmDialogData {
  name: string;
  nextStatus: boolean;
}

@Component({
  selector: 'app-payment-status-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton
  ],
  templateUrl: './payment-status-confirm-dialog.component.html',
})
export class PaymentStatusConfirmDialogComponent {
  readonly dialogRef = inject(MatDialogRef<PaymentStatusConfirmDialogComponent>);
  readonly data = inject<PaymentStatusConfirmDialogData>(MAT_DIALOG_DATA);

  confirm(): void {
    this.dialogRef.close(true);
  }
}
