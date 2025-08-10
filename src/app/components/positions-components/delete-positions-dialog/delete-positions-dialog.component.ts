import {Component, inject, OnInit} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {IngredientsService} from "../../../_services/ingredients.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {
  DeleteIngredientDialogueComponent,
  DeleteIngredientDialogueData
} from "../../ingredients-components/delete-ingredient-dialogue/delete-ingredient-dialogue.component";
import {Position} from "../../../models/Positions/Position";
import {PositionsService} from "../../../_services/positions.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-delete-positions-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatProgressSpinner
  ],
  templateUrl: './delete-positions-dialog.component.html',
  styleUrl: './delete-positions-dialog.component.css'
})
export class DeletePositionsDialogComponent {
  readonly dialogue = inject(MatDialogRef<DeletePositionsDialogComponent>);
  readonly data = inject<DeletePositionDialogueData>(MAT_DIALOG_DATA);

  public loading = false;

  constructor(private service:PositionsService, private toast:HotToastService) {

  }

  onSubmit(){
    this.loading = true;
    this.service.removePosition(this.data.position.id).subscribe({
      next: data => {
        if (!isMessage(data)) {
          this.toast.show("Видалено", {duration: 3000, position: "bottom-center", autoClose: true});
          this.loading = false;
          this.dialogue.close(this.data.position.id);
        }
      },
      error: error => {
        this.loading = false;
        this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    })
  }

  onClose() {
    this.dialogue.close();
  }
}

export interface DeletePositionDialogueData{
  position: Position;
}
