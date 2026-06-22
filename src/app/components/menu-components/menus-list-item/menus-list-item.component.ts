import {Component, inject, Input, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {DatePipe, NgClass} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Menu} from "../../../models/Menu/Menu";
import {DeleteMenuDialogComponent, DeleteMenuDialogData} from "../delete-menu-dialog/delete-menu-dialog.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrdersService} from "../../../_services/orders.service";
import {HotToastService} from "@ngxpert/hot-toast";



@Component({
  selector: 'app-orders-list-item',
  imports: [
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIconButton,
    NgClass,
    DatePipe
  ],
  templateUrl: './menus-list-item.component.html',
  styleUrl: './menus-list-item.component.css'
})
export class MenusListItemComponent implements OnInit {

  @Input() menu?:MinMenu;

  private dialog = inject(MatDialog);

  constructor(private orderService:OrdersService,
              private toast:HotToastService) {

  }


  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteMenuDialogComponent, {
      data:{
        id:this.menu?.id,
        date:this.menu?.date,
        client:this.menu?.client,
        price:this.menu?.totalPrice
      }
    }).afterClosed().subscribe(result => {
      this.orderService.store.removeOrder(result);
      this.orderService.store.removeMinOrder(result);
    });


  }

  ngOnInit(): void {
    console.log(this.menu);
  }

  toggleFavourite() {

    if(this.menu){
      this.menu.payed = !this.menu.payed;
      this.orderService.togglePayed(this.menu.id, this.menu.payed);
    }
  }


  downloadMenu(id:number){
    this.orderService.download(id).subscribe();
  }

  copyMenu(id: number) {
    this.orderService.copyOrder(id).subscribe({
      next: () => {
        this.toast.show("Замовлення скопійовано", {duration: 2000, position: "bottom-center", autoClose: true});
      },
      error: error => {
        this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
  }
}
