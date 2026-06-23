import {Component, inject} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatHint, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatRadioButton, MatRadioGroup} from "@angular/material/radio";
import {SelectedOrderPosition} from "../../../models/Orders/SelectedOrderPosition";

export interface OrderCheckoutData {
  fullName: string;
  phoneNumber: string;
  deliveryDate: string;
  deliveryTime: string;
  deliveryType: 'pickup' | 'shipping';
  address: string;
  needsDecorations: boolean;
  boxesOnly: boolean;
}

export interface OrderCheckoutDialogResult {
  positions: SelectedOrderPosition[];
  checkout: OrderCheckoutData;
}

interface OrderCheckoutDialogData {
  positions: SelectedOrderPosition[];
}

@Component({
  selector: 'app-order-checkout-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    ReactiveFormsModule,
    MatFormField,
    MatHint,
    MatLabel,
    MatInput,
    MatButton,
    MatCheckbox,
    MatRadioGroup,
    MatRadioButton
  ],
  templateUrl: './order-checkout-dialog.component.html',
  styleUrl: './order-checkout-dialog.component.css'
})
export class OrderCheckoutDialogComponent {
  readonly dialogRef = inject(MatDialogRef<OrderCheckoutDialogComponent>);
  readonly data = inject<OrderCheckoutDialogData>(MAT_DIALOG_DATA);

  readonly minDeliveryDate = this.getMinDeliveryDate();
  readonly pickupHint = "Самовивіз: Пн-Пт 10:00-17:00";

  readonly form = new FormGroup({
    fullName: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    phoneNumber: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    deliveryDate: new FormControl(this.minDeliveryDate, {nonNullable: true, validators: [Validators.required]}),
    deliveryTime: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
    deliveryType: new FormControl<'pickup' | 'shipping'>('pickup', {nonNullable: true, validators: [Validators.required]}),
    address: new FormControl('', {nonNullable: true}),
    needsDecorations: new FormControl(false, {nonNullable: true}),
    boxesOnly: new FormControl(false, {nonNullable: true}),
  });

  constructor() {
    this.form.controls.deliveryType.valueChanges.subscribe(type => {
      if (type === 'shipping') {
        this.form.controls.address.addValidators([Validators.required]);
      } else {
        this.form.controls.address.removeValidators([Validators.required]);
        this.form.controls.address.setValue('', {emitEvent: false});
      }
      this.form.controls.address.updateValueAndValidity({emitEvent: false});
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  submit(): void {
    this.form.controls.deliveryDate.setErrors(this.isDeliveryDateValid() ? null : {minDeliveryDate: true});

    if (this.form.invalid || !this.isDeliveryDateValid()) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close({
      positions: this.data.positions,
      checkout: this.form.getRawValue() as OrderCheckoutData
    } satisfies OrderCheckoutDialogResult);
  }

  get addressRequired(): boolean {
    return this.form.controls.deliveryType.value === 'shipping';
  }

  private isDeliveryDateValid(): boolean {
    const selected = this.form.controls.deliveryDate.value;
    return !!selected && selected >= this.minDeliveryDate;
  }

  private getMinDeliveryDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().slice(0, 10);
  }
}
