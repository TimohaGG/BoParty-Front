import {Component, computed, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from '@angular/material/dialog';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatInput} from '@angular/material/input';
import {MatButton} from '@angular/material/button';
import {MatOption, MatSelect} from '@angular/material/select';
import {entityStorage} from '../../../_helpers/storage/entityStorage';
import {IngredientsService} from '../../../_services/ingredients.service';
import {getAllUnits} from '../../../models/Positions/Units';
import {MatSelectSearchComponent} from 'ngx-mat-select-search';
import {MatDialog} from '@angular/material/dialog';
import {
  AddIngredientDialogueComponent
} from '../../ingredients-components/add-ingredient-dialogue/add-ingredient-dialogue.component';
import {Ingredient} from '../../../models/Positions/Ingredient';
import {MatIcon} from '@angular/material/icon';

export interface CreateShoppingItemDialogData {
  shoppingListId: number;
}

export interface CreateShoppingItemPayload {
  ingredientId: number;
  unitId: number;
  unitName: string;
  amount: number;
  shoppingListId: number;
}

@Component({
  selector: 'app-create-shopping-item-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatSelect,
    MatOption,
    MatSelectSearchComponent,
    MatIcon,
  ],
  templateUrl: './create-shopping-item-dialog.component.html',
  styleUrl: './create-shopping-item-dialog.component.css'
})
export class CreateShoppingItemDialogComponent implements OnInit {
  private store = inject(entityStorage);
  private dialogRef = inject(MatDialogRef<CreateShoppingItemDialogComponent>);
  readonly data = inject<CreateShoppingItemDialogData>(MAT_DIALOG_DATA);

  ingredients = computed(() => this.store.ingredientsEntities());
  units = getAllUnits().map((name, index) => ({id: index + 1, name}));
  ingredientSearch = new FormControl('');

  form = new FormGroup({
    ingredientId: new FormControl<number | null>(null, [Validators.required]),
    amount: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    unitId: new FormControl<number>(this.units[0]?.id ?? 1, [Validators.required]),
  });

  constructor(private ingredientsService: IngredientsService, private dialog: MatDialog) {
  }

  ngOnInit(): void {
    if(this.ingredients().length === 0){
      this.ingredientsService.getAll().subscribe();
    }
  }

  filteredIngredients() {
    const search = this.ingredientSearch.value?.trim().toLowerCase() ?? '';

    if(!search){
      return this.ingredients();
    }

    return this.ingredients().filter(ingredient => ingredient.name.toLowerCase().includes(search));
  }

  openAddIngredientDialog(event: Event): void {
    event.stopPropagation();
    event.preventDefault();

    const ref = this.dialog.open(AddIngredientDialogueComponent, {
      data: {
        name: this.ingredientSearch.value?.trim() ?? '',
        selectedCategory: 0,
      },
    });

    ref.afterClosed().subscribe((ingredient?: Ingredient) => {
      if(!ingredient){
        return;
      }

      this.ingredientSearch.setValue('');
      this.form.patchValue({ingredientId: ingredient.id});
    });
  }

  save(): void {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    const unit = this.units.find(item => item.id === this.form.value.unitId)!;
    this.dialogRef.close({
      ingredientId: this.form.value.ingredientId!,
      unitId: unit.id,
      unitName: unit.name,
      amount: Number(this.form.value.amount),
      shoppingListId: this.data.shoppingListId,
    } satisfies CreateShoppingItemPayload);
  }
}
