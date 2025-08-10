import {Component, inject, signal, ViewChild} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {PositionsListComponent} from "../../positions-components/positions-list/positions-list.component";
import {MatDialog} from "@angular/material/dialog";
import {AddOrderPositionDialogComponent} from "../add-order-position-dialog/add-order-position-dialog.component";
import {MatButton, MatFabButton} from "@angular/material/button";
import {Position} from "../../../models/Positions/Position";
import {PositionAmount} from "../../../models/Positions/PositionAmount";
import {KeyValuePipe, NgOptimizedImage} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatIcon} from "@angular/material/icon";
import {OrdersService} from "../../../_services/orders.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MinPosAmount} from "../../../models/Positions/MinPosAmount";

export interface PosAmount {
  amount: number;
  position: Position;
}

@Component({
  selector: 'app-add-order',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatTable,
    MatHeaderCell,
    MatCell,
    CdkDropList,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    CdkDrag,
    CdkDragPlaceholder,
    MatIcon,
    MatFabButton,
    ReactiveFormsModule,
  ],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.css'
})
export class AddOrderComponent {
  @ViewChild('table', {static: true}) table!: MatTable<PosAmount>;
  private dialog = inject(MatDialog);
  public selectedPositions: Position[] = []

  displayedColumns: string[] = [ 'action','name','image', 'weight', 'price', 'amount','action-delete'];

  public posAmounts:PosAmount[] = [];
  // public posAmounts = signal<PosAmount[]>([]);

  public ordersForm: FormGroup = new FormGroup({
    client: new FormControl('', [Validators.required]),
    guestsAmount: new FormControl('', [Validators.required]),
    format: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    duration: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
  })

  constructor(private ordersService:OrdersService) {
  }

  openPositionsDialog(){

    const ref = this.dialog.open(AddOrderPositionDialogComponent, {
      data:{
        positions:this.selectedPositions
      },
      width:"100%",
      maxWidth:"90vw",
      maxHeight:"90vh",
      height:"100%",
      panelClass:"full-width",
      disableClose:true,
      closeOnNavigation: false
    });

    ref.afterClosed().subscribe({
      next: (data)=> {
        if(data){
          this.selectedPositions = data;

          //delete what didn't come from selection
          this.posAmounts=this.posAmounts.filter(x=>this.selectedPositions.some(el=>el.id==x.position.id));

          for (let elem of this.selectedPositions) {
            if(this.posAmounts.findIndex(x=>x.position.id == elem.id)==-1){
              this.posAmounts.push({
                position:elem,
                amount:0
              });
            }
          }
        }

      }
    })



  }
  drop(event: CdkDragDrop<string>) {
    const previousIndex = this.posAmounts.findIndex(d => d === event.item.data);

    moveItemInArray(this.posAmounts, previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  print(){
    console.log(this.posAmounts);
  }

  save(){
    this.ordersService.saveOrder(this.ordersForm.value, this.posAmounts.map(x=>new MinPosAmount(x.position.id,x.amount))).subscribe(
      res=>{
        console.log(res);
      }
    );
  }


  changeAmount(id: number, event:any) {
    let index = this.posAmounts.findIndex(x=>x.position.id == id);
    if(index!=-1){
      this.posAmounts.at(index)!.amount  = event.target.value;
    }
  }

  removeFromList(id: number){

    let index = this.posAmounts.findIndex(x=>x.position.id == id);
    if(index!=-1){
      this.posAmounts.splice(index, 1);
    }
    index = this.selectedPositions.findIndex(x=>x.id==id);
    if(index!=-1){
      this.selectedPositions.splice(index, 1);
    }

    console.log(this.posAmounts);
    console.log(this.selectedPositions);
  }
}
