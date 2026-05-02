import {Component, computed, inject, Signal} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatOption, MatSelect} from "@angular/material/select";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {Order} from "../../../models/Orders/Order";
import {MatDialog} from "@angular/material/dialog";
import {OrderAddDialogComponent} from "../order-add/order-add-dialog.component";

@Component({
  selector: 'app-order-list-component',
  imports: [
    MatFormField,
    MatLabel,
    FormsModule,
    MatInput,
    MatIcon,
    MatIconButton,
    MatSelect,
    MatOption,
    MatButton
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
  standalone: true,
})
export class OrderListComponent {
  public month:number = new Date().getMonth()+1;
  public year:number = new Date().getFullYear();

  private dialog = inject(MatDialog);

  private store = inject(entityStorage);
  public orders:Signal<Order[]> = computed(this.store.ordersEntities);

  public monthList:Array<any> = [
    'Січень',
    'Лютий',
    'Березень',
    'Квітень',
    'Травень',
    'Червень',
    'Липень',
    'Серпень',
    'Вересень',
    'Жовтень',
    'Листопад',
    'Грудень',
  ];

  openDialog():void{
    const dialogRef = this.dialog.open(OrderAddDialogComponent, {
      data: {},
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }


}


