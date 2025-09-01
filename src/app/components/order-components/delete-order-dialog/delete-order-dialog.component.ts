import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {MatButton, MatFabButton} from "@angular/material/button";
import {OrdersService} from "../../../_services/orders.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-delete-order-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatFabButton,
    MatButton,
    MatProgressSpinner
  ],
  templateUrl: './delete-order-dialog.component.html',
  styleUrl: './delete-order-dialog.component.css'
})
export class DeleteOrderDialogComponent {

  readonly data = inject<DeleteOrderDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteOrderDialogComponent>);

  public loading = false;
   constructor(private service:OrdersService, private toast:HotToastService) {
   }

  onDeleteConfirm() {
    this.loading = true;
    this.service.deleteOrder(this.data.id).subscribe({
      next: data => {
        this.loading = false;
        this.dialogRef.close();
      },
      error: error => {
        this.toast.error(error.message);
      }
    });
  }
}

export interface DeleteOrderDialogData{
  id:number;
  date:string;
  client:string;
  price:number;
}
