import {Component, computed, inject, model, OnInit} from '@angular/core';
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
import {entityStorage} from "../../../_helpers/storage/entityStorage";

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
  styleUrl: './add-ingredient-dialogue.component.css',
  standalone: true
})
export class AddIngredientDialogueComponent implements OnInit {

  private store = inject(entityStorage);
  readonly dialogue = inject(MatDialogRef<AddIngredientDialogueComponent>);
  readonly data = inject<AddIngredientDialogueData>(MAT_DIALOG_DATA);
  readonly name = model(this.data.name);
  readonly categories = computed(()=>this.store.ingCategoriesEntities());
  readonly selected = model(this.data.selectedCategory);

  constructor(private ingService:IngredientsService,
              private toast:HotToastService,) {
  }

  ngOnInit(): void {
      if(this.categories().length == 0){
        this.ingService.getAllCategories().subscribe();
      }
    }

  onClose(){
    this.dialogue.close();
  }

  onSubmit(){

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
  selectedCategory:number;
}
