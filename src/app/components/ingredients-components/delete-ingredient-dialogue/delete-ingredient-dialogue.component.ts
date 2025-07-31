import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {IngredientsService} from "../../../_services/ingredients.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {isMessage} from "../../../models/Exceptions/ExceptionMessage";

@Component({
  selector: 'app-delete-ingredient-dialogue',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatButton
  ],
  templateUrl: './delete-ingredient-dialogue.component.html',
  styleUrl: './delete-ingredient-dialogue.component.css'
})
export class DeleteIngredientDialogueComponent {
  readonly dialogue = inject(MatDialogRef<DeleteIngredientDialogueComponent>);
  readonly data = inject<DeleteIngredientDialogueData>(MAT_DIALOG_DATA);

  constructor(private service:IngredientsService, private toast:HotToastService) {

  }

  onSubmit(){
    this.service.removeIngredient(this.data.id).subscribe({
      next: data => {
        if (!isMessage(data)) {
          this.toast.show("Видалено", {duration: 3000, position: "bottom-center", autoClose: true});
          this.dialogue.close(this.data.id);
        }
      },
      error: error => {
        this.toast.show(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    })
  }

  onClose() {
    this.dialogue.close();
  }
}

export interface DeleteIngredientDialogueData{
  name: string;
  id: number;
}
