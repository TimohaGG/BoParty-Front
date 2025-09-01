import {
  AfterViewInit,
  Component,
  computed,
  ElementRef,
  inject, Input, model,
  OnInit,
  signal,
  Signal,
  ViewChild,
  WritableSignal
} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
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
import {MatStep, MatStepLabel, MatStepper, MatStepperNext, MatStepperPrevious} from "@angular/material/stepper";
import {
  AddIngredientDialogueComponent
} from "../../ingredients-components/add-ingredient-dialogue/add-ingredient-dialogue.component";
import {PositionsService} from "../../../_services/positions.service";
import {resolve} from "@angular/compiler-cli";
import {HotToastService} from "@ngxpert/hot-toast";
import {Position} from "../../../models/Positions/Position";
import {
  AddCategoryDialogueData
} from "../../ingredients-components/add-category-dialogue/add-category-dialogue.component";



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
    MatButton,
    MatAutocomplete,
    MatAutocompleteTrigger,
    AsyncPipe,
    MatIcon,
    MatStepper,
    MatStep,
    MatStepLabel,
    MatStepperNext,
    MatDialogClose,
    MatStepperPrevious
  ],
  templateUrl: './add-position-dialog.component.html',
  styleUrl: './add-position-dialog.component.css'
})

export class AddPositionDialogComponent implements OnInit,AfterViewInit {

  // @Input() editPositionModel?:Position;
  readonly data = inject<EditPositionDialogueData>(MAT_DIALOG_DATA);
  readonly editPositionModel = model(this.data.position);


  public dialog = inject(MatDialog);
  private dialogRef = inject(MatDialogRef<AddPositionDialogComponent>);

  private store = inject(entityStorage);

  private selectedImage:File | null = null;
  public imagePreview: string | ArrayBuffer | null = null;
  @ViewChild("uplFile") private uplFile!:ElementRef<HTMLInputElement>;
  @ViewChild("image") imageRef?: ElementRef<HTMLInputElement>;

  public positionInfoGroup = new FormGroup({
    positionInfoCtrl: new FormControl(null),
    id: new FormControl(0),
    name: new FormControl('', [Validators.required]),
    weight: new FormControl('', [Validators.required]),
    price: new FormControl('', [Validators.required]),
    image: new FormControl(''),
    category: new FormControl(0, [Validators.required]),
  });
  public ingredientsInfoGroup = new FormGroup({
    ingredientsInfoCtrl: new FormControl(null),
    ingCtrl:new FormControl<string | Ingredient>(""),
  })

  public ingredients = computed(()=>this.store.ingredientsEntities());
  public filteredIngredients$:Observable<Ingredient[]> = of(this.ingredients());
  public selectedIngredients:IngredientAmount[] = []


  public categories = computed(()=>this.store.positionCategoriesEntities());

  constructor(
    private ingService:IngredientsService,
    private posService:PositionsService,
    private toast:HotToastService)
  {}

  ngAfterViewInit(): void {
    this.initEditModel();
    }

  ngOnInit(): void {
    const loadIngredients$:Observable<Ingredient[]> = this.ingredients().length === 0
      ? this.ingService.getAll()
      : of(null);

    this.initFilteredIngredients(loadIngredients$);


  }

  private initEditModel(){
    if(this.editPositionModel()){
      this.positionInfoGroup.controls.id.setValue(this.editPositionModel().id);
      this.positionInfoGroup.controls.name.setValue(this.editPositionModel().name);
      this.positionInfoGroup.controls.category.setValue(this.editPositionModel().category.id);
      this.positionInfoGroup.controls.weight.setValue(String(this.editPositionModel().weight));
      this.positionInfoGroup.controls.price.setValue(String(this.editPositionModel().price));
      this.selectedIngredients = this.editPositionModel().ingredients;
      if(this.imageRef && this.editPositionModel().image!="")
        this.imageRef.nativeElement.src="data:image/*;base64,"+this.editPositionModel().image;
    }
  }


  // Mat-autocomplete block

  private initFilteredIngredients(loadIngredients$:Observable<Ingredient[]>) {
    loadIngredients$.subscribe(() => {
      this.filteredIngredients$ = this.ingredientsInfoGroup.controls.ingCtrl.valueChanges.pipe(
        startWith(''),
        map(value => typeof value === 'string' ? value : value?.name ?? ''),
        map(name => name ? this._filter(name) : this.ingredients().slice())
      );
    });
  }

  private _filter(name: string): Ingredient[] {
    const filterValue = name.toLowerCase();
    return this.ingredients().filter(ing => ing.name.toLowerCase().includes(filterValue));
  }

  displayFn(ingredient: Ingredient): string {
    return ingredient?.name ?? '';
  }

  //File upload bock

  onFileUpload(event:any) {
    console.log("1");
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
    // event.stopPropagation();
    // event.preventDefault();
    console.log("asd");
    console.log(this.uplFile?.nativeElement);
    this.uplFile?.nativeElement.click();
  }

  //Ingredients selection blok

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
    this.ingredientsInfoGroup.controls.ingCtrl.setValue(null);

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

  protected readonly getAllUnits = getAllUnits;


  patchUnit(id:number, event: any) {
    let ingIndex = this.selectedIngredients.findIndex(x=>x.ingredient.id == id);
    if(ingIndex==-1) return;
    const unit = event.value;

    if(!unit) return;

    this.selectedIngredients.at(ingIndex)!.unit = unit;
  }

  openIngModal() {
    const addDialog = this.dialog.open(AddIngredientDialogueComponent,{
      data:{
        name:""
      }
    });

    addDialog.afterClosed().subscribe({
      next: (res:Ingredient)=> {
        this.initFilteredIngredients(of(this.ingredients()));
      }
    })
  }

  //submit block

  public onSubmit(event:any){
    if(!this.positionInfoGroup.valid || !this.ingredientsInfoGroup.valid){
      return;
    }

    console.log(this.selectedImage);

    let formData:FormData = new FormData();
    if(this.selectedImage)
      formData.set("image", this.selectedImage,this.selectedImage.name);


    formData.set("position", JSON.stringify({
      id:this.positionInfoGroup.get("id")!.value!,
      name:this.positionInfoGroup.get("name")!.value!,
      weight:this.positionInfoGroup.get("weight")!.value!,
      price:this.positionInfoGroup.get("price")!.value!,
      categoryId:this.positionInfoGroup.get("category")!.value!,
      ingredients:this.selectedIngredients,
    }));

    this.posService.addPosition(formData).subscribe({
      next:data=>{
        this.toast.show("Додано!",{duration:2000,position:"bottom-center",autoClose:true});
        console.log("data",data);
        this.dialogRef.close(data);
      },
      error:error=>{
        this.toast.show("Помилка!",{duration:2000,position:"bottom-center",autoClose:true});
      }
    })
    // console.log(this.positionForm.value);
    // console.log(event.targer.files[0]);
  }
}

export interface EditPositionDialogueData {
  position:Position;
}
