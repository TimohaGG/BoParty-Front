import {Component, inject, model} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {PositionsListComponent} from "../../positions-components/positions-list/positions-list.component";
import {Position} from "../../../models/Positions/Position";
import {
  AddCategoryDialogueData
} from "../../ingredients-components/add-category-dialogue/add-category-dialogue.component";


export interface AddOrderPositionDialogData {
  positions: Position[];
}
@Component({
  selector: 'app-add-order-position-dialog',
  imports: [
    MatDialogContent,
    PositionsListComponent
  ],
  templateUrl: './add-order-position-dialog.component.html',
  styleUrl: './add-order-position-dialog.component.css'
})
export class AddOrderPositionDialogComponent {
  readonly dialogue = inject(MatDialogRef<AddOrderPositionDialogComponent>);
  readonly data = inject<AddOrderPositionDialogData>(MAT_DIALOG_DATA);
  selectedPositions = model(this.data.positions);

  displaySelected(res:Position[]){
    this.dialogue.close(res);
  }

  deselect(id:number){
    this.selectedPositions().splice(this.selectedPositions().findIndex(x=>x.id==id),1);
  }
}
