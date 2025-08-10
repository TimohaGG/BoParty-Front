import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {MatButton, MatFabButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {Position} from "../../../models/Positions/Position";
import {MatDialog} from "@angular/material/dialog";
import {AddPositionDialogComponent} from "../add-position-dialog/add-position-dialog.component";
import {DeletePositionsDialogComponent} from "../delete-positions-dialog/delete-positions-dialog.component";

@Component({
  selector: 'app-positions-list-item',
  imports: [
    MatFabButton,
    MatIcon,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatButton
  ],
  templateUrl: './positions-list-item.component.html',
  styleUrl: './positions-list-item.component.css'
})
export class PositionsListItemComponent {
  @Input() position?:Position;
  @Input() selectable:boolean = false;
  @Input() isSelected:boolean = false;
  @Output() updateEdited = new EventEmitter<Position>();
  @Output() removeDeleted = new EventEmitter<number>();
  @Output() onSelect = new EventEmitter<Position>();
  @Output() onDeselect = new EventEmitter<number>();

  private dialog = inject(MatDialog);


  openModal(){
    const ref = this.dialog.open(AddPositionDialogComponent, {
      data: {
        position: this.position
      }
    });

    ref.afterClosed().subscribe(result => {
      this.updateEdited.emit(result);
    })
  }

  openDeleteModal(){
    const ref = this.dialog.open(DeletePositionsDialogComponent, {
      data: {
        position: this.position
      }
    });
    ref.afterClosed().subscribe(result => {
      this.removeDeleted.emit(result);
    })
  }

  selectPosition(){
    this.onSelect.emit(this.position);
  }

  deselectPosition(){
    this.onDeselect.emit(this.position?.id);
  }

}
