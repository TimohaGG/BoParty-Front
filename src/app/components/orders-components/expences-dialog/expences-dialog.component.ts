import {Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {forkJoin} from "rxjs";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {Expences, ExpencesRequest} from "../../../models/Expences/Expences";
import {Waiter} from "../../../models/Waiters/Waiter";
import {OrdersService} from "../../../_services/orders.service";
import {WaitersService} from "../../../_services/waiters.service";
import {DatePipe, DecimalPipe} from "@angular/common";

export interface ExpencesDialogData {
  expences?: Expences;
  startDate?: string;
  endDate?: string;
}

type WaiterForm = FormGroup<{
  waiterId: FormControl<number | null>;
  price: FormControl<number | null>;
}>;

type OtherExpenceForm = FormGroup<{
  id: FormControl<number | null>;
  name: FormControl<string>;
  amount: FormControl<number | null>;
}>;

type ShoppingSumForm = FormGroup<{
  id: FormControl<number | null>;
  name: FormControl<string>;
  date: FormControl<string | null>;
  sum: FormControl<number | null>;
}>;

@Component({
  selector: 'app-expences-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatSelect,
    MatOption,
    MatProgressSpinner,
    DatePipe,
    DecimalPipe
  ],
  templateUrl: './expences-dialog.component.html',
  styleUrl: './expences-dialog.component.css'
})
export class ExpencesDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<ExpencesDialogComponent>);
  readonly data = inject<ExpencesDialogData | null>(MAT_DIALOG_DATA, {optional: true});

  isEditMode = !!this.data?.expences;
  loadingOptions = false;
  menus: MinMenu[] = [];
  waitersList: Waiter[] = [];

  form = new FormGroup({
    menuId: new FormControl<number | null>(this.data?.expences?.menuId ?? null, [Validators.required]),
    cook: new FormControl<number>(this.data?.expences?.cook ?? 0, {nonNullable: true, validators: [Validators.required, Validators.min(0)]}),
    shoppingSums: new FormArray<ShoppingSumForm>([]),
    waiters: new FormArray<WaiterForm>([]),
    otherExpences: new FormArray<OtherExpenceForm>([]),
  });

  constructor(private ordersService: OrdersService, private waitersService: WaitersService) {
  }

  ngOnInit(): void {
    this.loadingOptions = true;
    forkJoin({
      menus: this.ordersService.getCurrentUserOrderOptions(),
      waiters: this.waitersService.getAll(),
    }).subscribe({
      next: ({menus, waiters}) => {
        this.menus = this.filterMenusByPeriod(menus);
        this.waitersList = waiters;
        this.patchRows();
        this.loadingOptions = false;
      },
      error: () => {
        this.patchRows();
        this.loadingOptions = false;
      }
    });
  }

  get waiters(): FormArray<WaiterForm> {
    return this.form.controls.waiters;
  }

  get shoppingSums(): FormArray<ShoppingSumForm> {
    return this.form.controls.shoppingSums;
  }

  get otherExpences(): FormArray<OtherExpenceForm> {
    return this.form.controls.otherExpences;
  }

  addShoppingSum(id: number | null = null, name = '', date: string | null = this.getTodayDate(), sum: number | null = null): void {
    this.shoppingSums.push(new FormGroup({
      id: new FormControl<number | null>(id),
      name: new FormControl<string>(name, {nonNullable: true, validators: [Validators.required]}),
      date: new FormControl<string | null>(date, [Validators.required]),
      sum: new FormControl<number | null>(sum, [Validators.required, Validators.min(0)]),
    }));
  }

  removeShoppingSum(index: number): void {
    this.shoppingSums.removeAt(index);
  }

  addWaiter(waiterId: number | null = null, price: number | null = null): void {
    this.waiters.push(new FormGroup({
      waiterId: new FormControl<number | null>(waiterId, [Validators.required]),
      price: new FormControl<number | null>(price, [Validators.required, Validators.min(0)]),
    }));
  }

  removeWaiter(index: number): void {
    this.waiters.removeAt(index);
  }

  addOtherExpence(id: number | null = null, name = '', amount: number | null = null): void {
    this.otherExpences.push(new FormGroup({
      id: new FormControl<number | null>(id),
      name: new FormControl<string>(name, {nonNullable: true, validators: [Validators.required]}),
      amount: new FormControl<number | null>(amount, [Validators.required, Validators.min(0)]),
    }));
  }

  removeOtherExpence(index: number): void {
    this.otherExpences.removeAt(index);
  }

  save(): void {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    const rawValue = this.form.getRawValue();
    const payload: ExpencesRequest = {
      id: this.data?.expences?.id,
      menuId: rawValue.menuId!,
      cook: Number(rawValue.cook),
      waiters: rawValue.waiters.map(item => ({
        waiterId: item.waiterId!,
        price: Number(item.price),
      })),
      shoppingSums: rawValue.shoppingSums.map(item => ({
        id: item.id ?? undefined,
        name: item.name,
        date: item.date,
        sum: Number(item.sum),
      })),
      otherExpences: rawValue.otherExpences.map(item => ({
        id: item.id ?? undefined,
        name: item.name,
        amount: Number(item.amount),
      })),
    };

    this.dialogRef.close(payload);
  }

  private patchRows(): void {
    const expences = this.data?.expences;

    if(!expences){
      return;
    }

    expences.shoppingSums?.forEach(item => this.addShoppingSum(item.id, item.name, item.date, item.sum));
    expences.waiters.forEach(waiter => this.addWaiter(waiter.waiterId, waiter.price));
    expences.otherExpences.forEach(item => this.addOtherExpence(item.id, item.name, item.amount));
  }

  private filterMenusByPeriod(menus: MinMenu[]): MinMenu[] {
    const startDate = this.data?.startDate;
    const endDate = this.data?.endDate;

    if(!startDate || !endDate){
      return menus;
    }

    return menus.filter(menu => {
      const menuDate = this.getDatePart(menu.date);
      return menuDate >= startDate && menuDate <= endDate;
    });
  }

  private getDatePart(date: string): string {
    return date.slice(0, 10);
  }

  private getTodayDate(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
