import {Component, inject, Input} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {NgClass} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {DeleteMenuDialogComponent} from "../delete-menu-dialog/delete-menu-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {OrdersService} from "../../../_services/orders.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize} from "rxjs";



@Component({
  selector: 'app-orders-list-item',
  imports: [
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIconButton,
    NgClass,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './menus-list-item.component.html',
  styleUrl: './menus-list-item.component.css'
})
export class MenusListItemComponent {

  @Input() menu?:MinMenu;
  loadingPdfType: 'menu' | 'shopping' | null = null;

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
  toggleFavourite() {

    if(this.menu){
      this.menu.payed = !this.menu.payed;
      this.orderService.togglePayed(this.menu.id, this.menu.payed);
    }
  }


  downloadMenu(id:number){
    this.loadingPdfType = 'menu';
    this.orderService.download(id, this.menu?.date).pipe(
      finalize(() => {
        this.loadingPdfType = null;
      })
    ).subscribe({
      error: error => {
        this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
  }

  downloadShoppingList(id: number) {
    this.loadingPdfType = 'shopping';
    this.orderService.downloadShoppingListPdf(id).pipe(
      finalize(() => {
        this.loadingPdfType = null;
      })
    ).subscribe({
      error: error => {
        this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
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
