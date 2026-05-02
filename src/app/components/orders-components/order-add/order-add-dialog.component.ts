import {Component, computed, inject, model, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {MatOption, MatSelect} from "@angular/material/select";

@Component({
  selector: 'app-order-add',
  imports: [
    MatDialogTitle,
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    FormsModule,
    MatSelect,
    MatOption
  ],
  templateUrl: './order-add-dialog.component.html',
  styleUrl: './order-add-dialog.component.css'
})
export class OrderAddDialogComponent implements OnInit {
  ngOnInit(): void {
      if(this.menus.length ==0){

      }
  }
  readonly dialogRef = inject(MatDialogRef<OrderAddDialogComponent>);
  readonly data = inject<OrderCreateDialogData>(MAT_DIALOG_DATA);
  readonly menu = model(this.data.menuId);

  private store = inject(entityStorage);
  readonly menus = computed(this.store.minMenusEntities);

  onNoClick(): void {
    this.dialogRef.close();
  }

}

export interface OrderCreateDialogData{
  menuId:number;
  shoppingSum:number;
  staffSum:number;
}
