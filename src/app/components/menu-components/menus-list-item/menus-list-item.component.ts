import {Component, inject, Input, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {NgClass} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Menu} from "../../../models/Menu/Menu";
import {DeleteMenuDialogComponent, DeleteMenuDialogData} from "../delete-menu-dialog/delete-menu-dialog.component";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrdersService} from "../../../_services/orders.service";



@Component({
  selector: 'app-orders-list-item',
  imports: [
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatButton,
    MatIconButton,
    NgClass
  ],
  templateUrl: './menus-list-item.component.html',
  styleUrl: './menus-list-item.component.css'
})
export class MenusListItemComponent implements OnInit {

  @Input() menu?:MinMenu;

  private dialog = inject(MatDialog);

  constructor(private orderService:OrdersService) {

  }


  openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteMenuDialogComponent, {
      data:{
        id:this.menu?.id,
        date:this.menu?.date,
        client:this.menu?.client,
        price:this.menu?.sum
      }
    });


  }

  ngOnInit(): void {

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
}
