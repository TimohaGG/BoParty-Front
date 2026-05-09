import {Component, inject, model, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
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
    MatFormField,
    MatLabel,
    MatSelect,
    ReactiveFormsModule,
    MatOption,
    DatePipe,
    MatDialogActions,
    MatButton,
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
