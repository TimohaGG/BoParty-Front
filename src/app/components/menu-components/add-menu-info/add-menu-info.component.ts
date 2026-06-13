import {Component, computed, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {OrdersService} from "../../../_services/orders.service";
import {MatCheckbox} from "@angular/material/checkbox";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {HotToastService} from "@ngxpert/hot-toast";
import {MatOption, MatSelect, MatSelectChange} from "@angular/material/select";
import {AdditionalMenuData} from "../../../models/Menu/AdditionalMenuData";

export interface AddMenuInfoDialogData {
  info?: AdditionalMenuData;
}

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
    MatButton,
    MatCheckbox,
    MatSelect,
    MatOption
  ],
  templateUrl: './add-menu-info.component.html',
  styleUrl: './add-menu-info.component.css'
})
export class AddMenuInfoComponent implements OnInit {

  readonly store = inject(entityStorage);
  readonly data = inject<AddMenuInfoDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  commonOptions = computed(()=>this.store.commonDataEntities());
  isEditMode = !!this.data?.info;



  dialogRef = inject(MatDialogRef<AddMenuInfoComponent>);
  formData = new FormGroup({
    title:new FormControl('', [Validators.required]),
    description:new FormControl('', [Validators.required]),
    price:new FormControl('', [Validators.required]),
    isCommon:new FormControl(false, [Validators.required]),
  })

  constructor(private service:OrdersService, private toast:HotToastService) {
    if(this.data?.info){
      this.formData.patchValue({
        title: this.data.info.title,
        description: this.data.info.description,
        price: String(this.data.info.price),
        isCommon: false,
      });
    }
  }

  ngOnInit(): void {
      if(this.commonOptions && this.commonOptions.length == 0){
        this.service.getAllCommonData().subscribe({
          next: data => {
            this.toast.show("Шаблони завантажено");
          },
          error: err => {
            this.toast.show(err);
          }
        });
      }
    }

  onClose(){
    if(this.formData.invalid){
      this.formData.markAllAsTouched();
      return;
    }

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
