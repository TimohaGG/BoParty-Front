import {Component, EventEmitter, inject, Input, Output} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {Position} from "../../../models/Positions/Position";
import {MatDialog} from "@angular/material/dialog";
import {AddPositionDialogComponent} from "../add-position-dialog/add-position-dialog.component";
import {PositionsService} from "../../../_services/positions.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {ArchivePositionDialogComponent} from "../archive-position-dialog/archive-position-dialog.component";

@Component({
  selector: 'app-positions-list-item',
  imports: [
    MatIcon,
    MatIconButton,
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
  @Output() archived = new EventEmitter<number>();
  @Output() onSelect = new EventEmitter<Position>();
  @Output() onDeselect = new EventEmitter<number>();

  private dialog = inject(MatDialog);
  private positionsService = inject(PositionsService);
  private toast = inject(HotToastService);


  openModal(){
    if(!this.position){
      return;
    }

    this.positionsService.getById(this.position.id).subscribe(result => {
      if(isMessage(result)){
        this.toast.error((result as any).message);
        return;
      }

      this.openEditDialog(result as Position);
    });
  }

  private openEditDialog(position: Position){
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const ref = this.dialog.open(AddPositionDialogComponent, {
      data: {
        position
      },
      ...(isMobile ? {
        width: "100vw",
        maxWidth: "100vw",
        height: "100dvh",
        maxHeight: "100dvh",
        panelClass: "full-screen",
      } : {
        width: "min(900px, calc(100vw - 32px))",
        maxWidth: "calc(100vw - 32px)",
        height: "auto",
        maxHeight: "90vh",
        panelClass: "position-dialog-panel",
      }),
    });

    ref.afterClosed().subscribe(result => {
      this.updateEdited.emit(result);
    });
  }

  openArchiveModal(){
    if(!this.position){
      return;
    }

    const ref = this.dialog.open(ArchivePositionDialogComponent, {
      data: {
        position: this.position
      }
    });
    ref.afterClosed().subscribe(result => {
      if(result){
        this.archived.emit(result);
      }
    })
  }

  selectPosition(){
    this.onSelect.emit(this.position);
  }

  deselectPosition(){
    this.onDeselect.emit(this.position?.id);
  }

}
