import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {OrdersService} from "../../../_services/orders.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-delete-order-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatProgressSpinner
  ],
  templateUrl: './delete-menu-dialog.component.html',
  styleUrl: './delete-menu-dialog.component.css'
})
export class DeleteMenuDialogComponent {

  readonly data = inject<DeleteMenuDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<DeleteMenuDialogComponent>);

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

export interface DeleteMenuDialogData {
  id:number;
  date:string;
  client:string;
  price:number;
}
