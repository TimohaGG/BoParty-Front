import {Component, inject, Input} from '@angular/core';
import {MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {DatePipe} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Menu} from "../../../models/Menu/Menu";
import {DeleteMenuDialogComponent, DeleteMenuDialogData} from "../delete-menu-dialog/delete-menu-dialog.component";
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
  templateUrl: './menus-list-item.component.html',
  styleUrl: './menus-list-item.component.css'
})
export class MenusListItemComponent {

  @Input() menu?:MinMenu;

  private dialog = inject(MatDialog);

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
}
