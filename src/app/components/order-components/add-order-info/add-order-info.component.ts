import {Component, computed, inject, OnInit} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {MatButton, MatFabButton} from "@angular/material/button";
import {OrdersService} from "../../../_services/orders.service";
import {MatCheckbox} from "@angular/material/checkbox";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {HotToastService} from "@ngxpert/hot-toast";
import {MatOption, MatSelect, MatSelectChange} from "@angular/material/select";

@Component({
  selector: 'app-add-order-info',
  imports: [
    MatDialogContent,
    MatFormField,
    MatLabel,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    MatInput,
    MatFabButton,
    MatButton,
    MatCheckbox,
    MatSelect,
    MatOption
  ],
  templateUrl: './add-order-info.component.html',
  styleUrl: './add-order-info.component.css'
})
export class AddOrderInfoComponent implements OnInit {

  readonly store = inject(entityStorage);

  commonOptions = computed(()=>this.store.commonDataEntities());



  dialogRef = inject(MatDialogRef<AddOrderInfoComponent>);
  formData = new FormGroup({
    title:new FormControl('', [Validators.required]),
    description:new FormControl('', [Validators.required]),
    price:new FormControl('', [Validators.required]),
    isCommon:new FormControl(false, [Validators.required]),
  })

  constructor(private service:OrdersService, private toast:HotToastService) {
  }

  ngOnInit(): void {
      if(this.commonOptions && this.commonOptions.length == 0){
        this.service.getAllCommonData().subscribe({
          next: data => {
            this.toast.show("Варіанти завантажено");
          },
          error: err => {
            this.toast.show(err);
          }
        });
      }
    }

  onClose(){
    this.dialogRef.close(this.formData.value);
  }

  insertData($event: MatSelectChange<any>) {
    this.formData.patchValue({
      title: $event.value.title,
      description: $event.value.description,
      price: $event.value.price,
    })
  }
}
