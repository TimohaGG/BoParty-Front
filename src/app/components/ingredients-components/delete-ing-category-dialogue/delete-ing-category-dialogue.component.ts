import {Component, inject} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {IngredientsService} from "../../../_services/ingredients.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {DeleteIngredientDialogueData} from "../delete-ingredient-dialogue/delete-ingredient-dialogue.component";

@Component({
  selector: 'app-delete-ing-category-dialogue',
    imports: [
        MatButton,
        MatDialogActions,
        MatDialogContent
    ],
  templateUrl: './delete-ing-category-dialogue.component.html',
  styleUrl: './delete-ing-category-dialogue.component.css'
})
export class DeleteIngCategoryDialogueComponent {
  readonly dialogue = inject(MatDialogRef<DeleteIngCategoryDialogueComponent>);
  readonly data = inject<DeleteIngredientDialogueData>(MAT_DIALOG_DATA);

  constructor(private service:IngredientsService, private toast:HotToastService) {

  }

  onSubmit(){
    this.service.removeCategory(this.data.id).subscribe({
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
