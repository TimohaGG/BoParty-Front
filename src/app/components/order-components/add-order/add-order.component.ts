import {Component, inject, Input, OnInit, signal, ViewChild} from '@angular/core';
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
import {CdkContextMenuTrigger, CdkMenu, CdkMenuItem} from "@angular/cdk/menu";
import {TableRow} from "../../../models/Pdf/TableCell";
import {AddHeaderDialogComponent} from "../add-header-dialog/add-header-dialog.component";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {HotToastService} from "@ngxpert/hot-toast";
import {Order} from "../../../models/Orders/Order";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HttpErrorResponse} from "@angular/common/http";

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
    CdkMenu,
    CdkMenuItem,
    CdkContextMenuTrigger,
    MatProgressSpinner,
  ],
  templateUrl: './add-order.component.html',
  styleUrl: './add-order.component.css'
})
export class AddOrderComponent implements OnInit {
  @ViewChild('table', {static: true}) table!: MatTable<PositionAmount>;

  public editOrderid:number = -1;

  editable:boolean = false;
  loading:boolean = false;

  private dialog = inject(MatDialog);
  public selectedPositions: Position[] = []

  displayedColumns: string[] = [ 'action','name','image', 'weight', 'price', 'amount','action-delete'];

  public posAmounts = signal<TableRow[]>([]);

  public ordersForm: FormGroup = new FormGroup({
    client: new FormControl('', [Validators.required]),
    guestsAmount: new FormControl('', [Validators.required]),
    format: new FormControl('', [Validators.required]),
    date: new FormControl('', [Validators.required]),
    duration: new FormControl('', [Validators.required]),
    phoneNumber: new FormControl('', [Validators.required]),
  })

  constructor(private ordersService:OrdersService,private route:ActivatedRoute,private router:Router,private toast:HotToastService) {
    this.ordersForm.disable();
    this.editOrderid = Number(this.route.snapshot.queryParamMap.get("orderId")) ?? -1;
    console.log(this.editOrderid);
  }

  ngOnInit(): void {
    this.initOrderEditData();
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
          this.posAmounts.set(this.posAmounts().filter(x=>this.selectedPositions.some(el=>el.id===x.id || x.unitedRow)));
          for (let elem of this.selectedPositions) {
            if(this.posAmounts().findIndex(x=>x.id == elem.id)==-1){
              this.posAmounts().push(new TableRow(elem,0));
            }
          }
        }

      }
    })
  }

  initOrderEditData(){
    if(this.editOrderid<=0){
      console.log("No order id");
      return;
    }
    this.loading = true;
    this.ordersService.getById(this.editOrderid).subscribe(
      (res:Order|ExceptionMessage)=>{
        if(isMessage(res)){
          this.toast.show("Can't load order!",{autoClose:true,position:"bottom-center",duration:2000})
            .afterClosed.subscribe(()=>{
            this.router.navigate(['/']);
          });
        }
        else{
          this.ordersForm.patchValue({
            client:(res as Order).client,
            guestsAmount:(res as Order).guestsAmount,
            format:(res as Order).format,
            date:(res as Order).date.slice(0,(res as Order).date.indexOf('T')),
            duration:(res as Order).duration,
            phoneNumber:(res as Order).phone
          });
          let recieved = (res as Order).positions;
          let list:TableRow[] = [];
          recieved.forEach(el=>{
            if(el.title!=="" && el.title!==null){
              console.log(el.title);
              list.push(new TableRow(null,0,el.title,true));
            }
            list.push(new TableRow(el.position,el.amount));
            this.selectedPositions.push(el.position);
          });
          this.posAmounts.set(list);
        }
        this.loading = false;
      }

    );
  }
  drop(event: CdkDragDrop<string>) {
    const previousIndex = this.posAmounts().findIndex(d => d === event.item.data);
    moveItemInArray(this.posAmounts(), previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  print(){
    console.log(this.posAmounts);
  }

  toggleEdit(){
    this.editable = !this.editable;
    this.editable ? this.ordersForm.enable() : this.ordersForm.disable();
  }

  save(){
    let items = this.parsePositions()
    this.loading = true;

    if(this.editOrderid<=0){
      this.ordersService.saveOrder(this.ordersForm.value,items).subscribe(
        {
          next: (data)=> {
            this.toast.show("Збережено!",{autoClose:true,position:"bottom-center",duration:2000})
            this.loading = false;
          },
          error:(error:HttpErrorResponse)=>{
            this.toast.show(`Помилка збереження!\n${error}`,{autoClose:true,position:"bottom-center",duration:2000});
            this.loading = false;
          }
        }
      );
    }else{
      this.ordersService.editOrder(this.editOrderid, this.ordersForm.value,items).subscribe({
        next: (data)=> {
          this.toast.show("Збережено!",{autoClose:true,position:"bottom-center",duration:2000});
          this.loading = false;
        },
        error: (data)=> {
          this.toast.show(`Помилка редагування!\n${data}`,{autoClose:true,position:"bottom-center",duration:2000});
          this.loading = false;
        }
      }
      );
    }


  }

  parsePositions(){
    let items:MinPosAmount[] = [];
    if(this.posAmounts()){
      const amounts = this.posAmounts();
      amounts.forEach((row, i) => {
        if (row.unitedRow) {
          return; // skip unitedRow entries
        }

        const prev = amounts[i - 1];

        if (i > 0 && prev?.unitedRow) {
          items.push(new MinPosAmount(
            row.id as number,
            row.amount as number,
            prev.title as string
          ));
        } else {
          items.push(new MinPosAmount(
            row.id as number,
            row.amount as number
          ));
        }
      });
    }
    return items;
  }



  changeAmount(id: number, event:any) {
    let index = this.posAmounts().findIndex(x=>x.position !==null && x.position.id == id);
    if(index!=-1){
      this.posAmounts().at(index)!.amount  = event.target.value;
    }
  }


  sortPredicate = (index: number, item: CdkDrag<TableRow>) => {
    const arr = this.posAmounts();
    const lastIndex = arr.length - 1;

    const oldIndex = arr.indexOf(item.data);
    if (oldIndex === -1) console.log("Error");
    const copy = [...arr];
    copy.splice(oldIndex, 1);
    copy.splice(index, 0, item.data);
    if(copy.at(copy.length-1)?.unitedRow){
      return false;
    }

    if (!item.data.unitedRow) return true;
    if (index >= lastIndex) return false;
    return true;
  };

  removeFromList(id: number | string){
    let index: number;

    this.posAmounts.update(items=>
      items.filter(x=> x.id!==id)
    );

    index = this.selectedPositions.findIndex(x=>x.id==id);
    if(index!=-1){
      this.selectedPositions.splice(index, 1);
    }
  }

  prints(e:any){
    console.log(e);
  }

  openHeaderDialog(positionId:number){
    const dialogRef = this.dialog.open(AddHeaderDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (data)=> {
        console.log(data);
        if(data){
          let index = this.posAmounts().findIndex(x=>x.id==positionId);
          if(index==-1){
            this.posAmounts.update(arr=>[...arr,new TableRow(null,0,data, true) ]);
          }else{
            this.posAmounts.update(arr=>[
              ...arr.slice(0,index),
              new TableRow(null,1,data,true,crypto.randomUUID()),
              ...arr.slice(index),
            ]);
          }

        }
      }
    })
  }
}


