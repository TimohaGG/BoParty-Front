import {Component, inject, model} from '@angular/core';
import {MatButton} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {MatFormField, MatInput, MatLabel} from "@angular/material/input";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {AddCategoryDialogueData} from "../add-category-dialogue/add-category-dialogue.component";
import {IngredientsService} from "../../../_services/ingredients.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {Category} from "../../../models/Positions/Category";
import {MatOption} from "@angular/material/core";
import {MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-add-ingredient-dialogue',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatFormField,
    MatInput,
    MatLabel,
    ReactiveFormsModule,
    MatFormField,
    FormsModule,
    MatSelect,
    MatOption,
  ],
  templateUrl: './add-ingredient-dialogue.component.html',
  styleUrl: './add-ingredient-dialogue.component.css'
})
export class AddIngredientDialogueComponent {

  readonly dialogue = inject(MatDialogRef<AddIngredientDialogueComponent>);
  readonly data = inject<AddIngredientDialogueData>(MAT_DIALOG_DATA);
  readonly name = model(this.data.name);
  readonly categories = model(this.data.categories);
  readonly selected = model(this.data.selectedCategory);

  constructor(private ingService:IngredientsService, private toast:HotToastService,) {
  }

  onClose(){
    this.dialogue.close();
  }

  onSubmit(){

    console.log(this.selected());

    this.ingService.addIngredient(this.name(),this.selected()).subscribe({
      next: res=>{
        if(res!=undefined)
          this.dialogue.close(res);
      },
      error:err=>{
        this.toast.show("Error adding ingredient",{duration:2000, position:"bottom-center",autoClose:true});
      }
    });



  }

}

export interface AddIngredientDialogueData {
  name: string;
  categories:Category[];
  selectedCategory:number;
}
