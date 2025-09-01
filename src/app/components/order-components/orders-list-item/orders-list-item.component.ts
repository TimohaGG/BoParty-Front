import {Component, inject, Input} from '@angular/core';
import {MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MinOrder} from "../../../models/Orders/MinOrder";
import {DatePipe} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Order} from "../../../models/Orders/Order";
import {DeleteOrderDialogComponent, DeleteOrderDialogData} from "../delete-order-dialog/delete-order-dialog.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
  selector: 'app-orders-list-item',
  imports: [
    MatFabButton,
    MatIcon,
    DatePipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './orders-list-item.component.html',
  styleUrl: './orders-list-item.component.css'
})
export class OrdersListItemComponent {

  @Input() order?:MinOrder;

  private dialog = inject(MatDialog);

  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteOrderDialogComponent, {
      data:{
        id:this.order?.id,
        date:this.order?.date,
        client:this.order?.client,
        price:this.order?.sum
      }
    });


  }
}
