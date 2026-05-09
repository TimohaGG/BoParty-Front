import {Component, inject, model, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {PositionsListComponent} from "../../positions-components/positions-list/positions-list.component";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormControl, FormsModule, ReactiveFormsModule, Validators} from "@angular/forms";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {OrdersService} from "../../../_services/orders.service";
import {DatePipe} from "@angular/common";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";

@Component({
  selector: 'app-shopping-join-dialog',
  imports: [
    MatDialogContent,
    PositionsListComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    DatePipe,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    FormsModule,
    MatProgressSpinner,
  ],
  templateUrl: './shopping-join-dialog.component.html',
  styleUrl: './shopping-join-dialog.component.css'
})
export class ShoppingJoinDialogComponent implements OnInit {
  ngOnInit(): void {
     this.orderService.getAllOrders().subscribe(res=>{
       this.ordersList = res;
     })
  }

  readonly data = inject<DialogData>(MAT_DIALOG_DATA)
  readonly dialogRef = inject(MatDialogRef<ShoppingJoinDialogComponent>)
  ordersList:MinMenu[] = []

  selected = model(this.data.selectedOrders);
  loading: boolean = false;

  constructor(private orderService:OrdersService) {
  }

  close(){
    this.dialogRef.close();
  }

  onSubmit(){
  this.loading = true;
    if(this.selected()){
      this.orderService.joinOrders(this.selected()).subscribe(
        res=>{
          this.loading = false;
          this.dialogRef.close(this.selected);
        }
      );
    }

  }
}

interface DialogData{
  selectedOrders:number[];
}
