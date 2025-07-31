import {
  Component,
  computed,
  ElementRef,
  inject,
  OnInit,
  signal,
  Signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {IngredientsService} from "../../../_services/ingredients.service";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatSelect} from "@angular/material/select";
import {MatLine, MatOption} from "@angular/material/core";
import {MatButton} from "@angular/material/button";
import {MatSelectSearchComponent} from "ngx-mat-select-search";
import {MatAutocomplete, MatAutocompleteTrigger} from "@angular/material/autocomplete";
import {map, Observable, of, startWith} from "rxjs";
import {Ingredient} from "../../../models/Positions/Ingredient";
import {AsyncPipe} from "@angular/common";
import {IngredientAmountComponent} from "../ingredient-amount/ingredient-amount.component";
import {IngredientAmount} from "../../../models/Positions/IngredientAmount";
import {getAllUnits, UnitType} from "../../../models/Positions/Units";
import {MatIcon} from "@angular/material/icon";

@Component({
  selector: 'app-add-position-dialog',
  imports: [
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    FormsModule,
    ReactiveFormsModule,
    MatSelect,
    MatOption,
    MatDialogActions,
    MatButton,
    MatSelectSearchComponent,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AsyncPipe,
    IngredientAmountComponent,
    MatIcon
  ],
  templateUrl: './add-position-dialog.component.html',
  styleUrl: './add-position-dialog.component.css'
})
export class AddPositionDialogComponent implements OnInit {

  private store = inject(entityStorage);
  private dialogRef = inject(MatDialogRef<AddPositionDialogComponent>);
  private selectedImage:File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;
  public positionForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    weight: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required]),
    image: new FormControl(null, [Validators.required]),
    category: new FormControl(0, [Validators.required]),
    ingCtrl:new FormControl<string | Ingredient>(""),
  })


  public ingredients = computed(()=>this.store.ingredientsEntities());
  public filteredIngredients$:Observable<Ingredient[]> = of(this.ingredients());
  public selectedIngredients:IngredientAmount[] = []


  public categories = computed(()=>this.store.positionCategoriesEntities());

  @ViewChild("updFile") private uplFile?:ElementRef<HTMLInputElement>;

  constructor(private ingService:IngredientsService) { }

  ngOnInit(): void {
    if(this.ingredients().length == 0){
      this.ingService.getAll().subscribe(res=>{
        this.filteredIngredients$ = of(this.ingredients());
      });
    }

    this.filteredIngredients$ = this.positionForm.controls.ingCtrl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : value?.name),
      map(name => name ? this._filter(name) : this.ingredients().slice())
    );
  }

  public onSubmit(event:any){
    console.log(this.positionForm.value);
    console.log(event.targer.files[0]);
  }

  public onClose(){
    this.dialogRef.close();
  }

  onFileUpload(event:any) {
    this.selectedImage = event.target.files[0];
    const reader = new FileReader();
    reader.onload = ()=>{
      this.imagePreview = reader.result;
    }
    if(this.selectedImage){
      reader.readAsDataURL(this.selectedImage);
    }
  }

  uploadImage(event:any) {
    event.stopPropagation();
    event.preventDefault();
    this.uplFile?.nativeElement.click();
  }

  onIngSelect(event:any){
    const item = event.option.value;
    if(!item){
      return;
    }
    if(!this.selectedIngredients.find(x=>x.ingredient.id == item.id)){
      const ingAmount:IngredientAmount = {
        ingredient:item,
        amount:0,
        unit:UnitType.grams
      }
      this.selectedIngredients.push(ingAmount);
    }
    this.positionForm.controls.ingCtrl.setValue(null);

  }

  private _filter(name: string): Ingredient[] {
    const filterValue = name.toLowerCase();
    return this.ingredients().filter(ing => ing.name.toLowerCase().includes(filterValue));
  }

  displayFn(ingredient: Ingredient): string {
    return ingredient?.name ?? '';
  }

  patchAmount(id:number, amount:number | Event, event:Event|null = null){
    if(event){
      event.stopPropagation();
      event.preventDefault();
    }


    let elemId = this.selectedIngredients.findIndex(x=>x.ingredient.id == id);
    if(elemId==-1){
      return;
    }
    const ingAmount = typeof (amount) =='number'?amount:Number((amount.target as HTMLInputElement).value);
    if(ingAmount <0)
      return;
    if(ingAmount==0){
      this.selectedIngredients.splice(elemId,1);
      return;
    }
    this.selectedIngredients.at(elemId)!.amount = ingAmount;
  }

  protected readonly UnitType = UnitType;
  protected readonly getAllUnits = getAllUnits;
}
