import {Component, inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatOption, MatSelect} from "@angular/material/select";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {forkJoin} from "rxjs";
import {DatePipe, DecimalPipe} from "@angular/common";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {Expences, ExpencesRequest} from "../../../models/Expences/Expences";
import {Staff, StaffType} from "../../../models/Waiters/Waiter";
import {OrdersService} from "../../../_services/orders.service";
import {StaffService} from "../../../_services/waiters.service";

export interface ExpencesDialogData {
  expences?: Expences;
  startDate?: string;
  endDate?: string;
  usedMenuIds?: number[];
}

type StaffForm = FormGroup<{
  staffId: FormControl<number | null>;
  price: FormControl<number | null>;
  payed: FormControl<boolean>;
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
    MatCheckbox,
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
  staffList: Staff[] = [];
  readonly staffTypes: {value: StaffType; label: string}[] = [
    {value: 'WAITER', label: 'Офіціант'},
    {value: 'COOK', label: 'Кухар'},
  ];

  form = new FormGroup({
    menuId: new FormControl<number | null>(this.data?.expences?.menuId ?? null, [Validators.required]),
    shoppingSums: new FormArray<ShoppingSumForm>([]),
    staff: new FormArray<StaffForm>([]),
    otherExpences: new FormArray<OtherExpenceForm>([]),
  });

  constructor(private ordersService: OrdersService, private staffService: StaffService) {
  }

  ngOnInit(): void {
    this.loadingOptions = true;
    forkJoin({
      menus: this.ordersService.getCurrentUserOrderOptions(),
      staff: this.staffService.getAll(),
    }).subscribe({
      next: ({menus, staff}) => {
        this.menus = this.filterMenus(menus);
        this.staffList = staff;
        this.patchRows();
        this.loadingOptions = false;
      },
      error: () => {
        this.patchRows();
        this.loadingOptions = false;
      }
    });
  }

  get staff(): FormArray<StaffForm> {
    return this.form.controls.staff;
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

  addStaff(staffId: number | null = null, price: number | null = null, payed = false): void {
    this.staff.push(new FormGroup({
      staffId: new FormControl<number | null>(staffId, [Validators.required]),
      price: new FormControl<number | null>(price, [Validators.required, Validators.min(0)]),
      payed: new FormControl<boolean>(payed, {nonNullable: true}),
    }));
  }

  removeStaff(index: number): void {
    this.staff.removeAt(index);
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
      staff: rawValue.staff.map(item => ({
        staffId: item.staffId!,
        price: Number(item.price),
        payed: item.payed,
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

  getStaffTypeLabel(type: StaffType | null): string {
    return this.staffTypes.find(item => item.value === type)?.label ?? 'Персонал';
  }

  private patchRows(): void {
    const expences = this.data?.expences;

    if(!expences){
      return;
    }

    expences.shoppingSums?.forEach(item => this.addShoppingSum(item.id, item.name, item.date, item.sum));
    expences.staff.forEach(item => this.addStaff(item.staffId, item.price, item.payed));
    expences.otherExpences.forEach(item => this.addOtherExpence(item.id, item.name, item.amount));
  }

  private filterMenus(menus: MinMenu[]): MinMenu[] {
    const startDate = this.data?.startDate;
    const endDate = this.data?.endDate;
    const currentMenuId = this.data?.expences?.menuId;
    const usedMenuIds = new Set(this.data?.usedMenuIds ?? []);

    return menus.filter(menu => {
      if(usedMenuIds.has(menu.id) && menu.id !== currentMenuId){
        return false;
      }

      if(!startDate || !endDate){
        return true;
      }

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
