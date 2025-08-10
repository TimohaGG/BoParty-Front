import {
  AfterViewInit,
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
  signal,
  Signal,
  WritableSignal
} from '@angular/core';
import {PositionsListItemComponent} from "../positions-list-item/positions-list-item.component";
import {PositionsService} from "../../../_services/positions.service";
import {Position} from "../../../models/Positions/Position";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {HotToastService} from "@ngxpert/hot-toast";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {Category} from "../../../models/Positions/Category";
import {PositionsCategoryService} from "../../../_services/positions-category.service";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {MatButton, MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatDialog} from "@angular/material/dialog";
import {AddPositionDialogComponent} from "../add-position-dialog/add-position-dialog.component";

@Component({
  selector: 'app-positions-list',
  imports: [
    PositionsListItemComponent,
    MatProgressSpinner,
    MatButtonToggleGroup,
    MatButtonToggle,
    ReactiveFormsModule,
    MatButton,
    MatIcon,
    MatFabButton,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger
  ],
  templateUrl: './positions-list.component.html',
  styleUrl: './positions-list.component.css'
})
export class PositionsListComponent implements OnInit, AfterViewInit {

  @Input() selectable:boolean = false;
  @Output() onSelectPosition = new EventEmitter<Position[]>();
  @Output() onDeselectPosition = new EventEmitter<number>();
  @Input() selectedPositions: Position[] = [];

  readonly dialogue = inject(MatDialog);
  private store = inject(entityStorage);
  public positions:Signal<Position[]> = computed(()=>this.store.positionsEntities());
  public filteredPositions:WritableSignal<Position[] | null> = signal(null);



  public categories:Signal<Category[]> = computed(this.store.positionCategoriesEntities);
  public selectedCategory:FormControl = new FormControl(0);
  constructor(private positionsService:PositionsService,
              private toast:HotToastService,
              private categoriesService:PositionsCategoryService) {

  }

  ngAfterViewInit(): void {
        console.log("afterInit" , this.selectedPositions);
    }

  ngOnInit(): void {
    console.log("Component ngOnInit");
    if(this.positions().length==0){
      this.positionsService.getAll().subscribe(
        res=>{
          if(isMessage(res)){
            let msg = res as ExceptionMessage;
            this.toast.error(msg.message, {duration: 3000, position: "bottom-center", autoClose: true});
          }
          else{
            this.filterCategories();
          }
        }
      )
    }
    else{
      console.log("Positions are in the vault", this.positions().length);
    }
    if(this.categories().length == 0){
      this.categoriesService.getAll().subscribe({
        error: error=>{
          this.toast.show(error.message,{duration:3000,position:"bottom-center",autoClose:true});
        }
      });
    }
    else{
      this.filterCategories();
      console.log("Categories are in the vault", this.categories().length);
    }

  }

  filterCategories() {
    let categoryId = this.selectedCategory.value;
    console.log("categoryId", categoryId);
    if(categoryId==0){
      this.filteredPositions.set(this.positions());
    }
    else{
      this.filteredPositions.set(this.positions().filter((pos)=>pos.category.id==categoryId));
    }
  }

  openCreateDialog() {
    let dialogRef = this.dialogue.open(AddPositionDialogComponent, {
      data:{
        position:null
      },
      panelClass:"full-screen",

    });

    dialogRef.afterClosed().subscribe((result:Position) => {

      this.filterCategories();
      console.log("Filtering");
      // if(this.filteredPositions()){
      //   this.filteredPositions.set([...this.filteredPositions()!,result]);
      // }else{
      //   this.filteredPositions.set([result]);
      // }


    })
  }

  selectPosition(position:Position){
    this.selectedPositions.push(position);
  }

  sendSelection(){
    this.onSelectPosition.emit(this.selectedPositions);
  }

  sendDeselection(id:number){
    this.onDeselectPosition.emit(id)
  }

  isSelected(id:number){
    if(this.selectedPositions)
      return this.selectedPositions.findIndex(pos=>pos.id==id)!=-1;
    return false;
  }


}
