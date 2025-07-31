import {Component, Input, OnInit} from '@angular/core';
import {Ingredient} from "../../../models/Positions/Ingredient";
import {IngredientAmount} from "../../../models/Positions/IngredientAmount";
import {UnitType} from "../../../models/Positions/Units";

@Component({
  selector: 'app-ingredient-amount',
  imports: [],
  templateUrl: './ingredient-amount.component.html',
  styleUrl: './ingredient-amount.component.css'
})
export class IngredientAmountComponent implements OnInit {
  ngOnInit(): void {
      throw new Error('Method not implemented.');
  }
  @Input() ingredients:Ingredient[] | null = null;
  public ingAmount:IngredientAmount | null= null;
}
