import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatCheckbox, MatCheckboxChange} from "@angular/material/checkbox";
import {MatDialog} from "@angular/material/dialog";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {Expences, ExpencesRequest} from "../../../models/Expences/Expences";
import {OrdersService} from "../../../_services/orders.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize} from "rxjs";
import {
  PaymentStatusConfirmDialogComponent
} from "./payment-status-confirm-dialog.component";

@Component({
  selector: 'app-payments-status',
  standalone: true,
  imports: [
    FormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatIcon,
    MatButton,
    MatIconButton,
    MatCheckbox,
    MatProgressSpinner
  ],
  templateUrl: './payments-status.component.html',
  styleUrl: './payments-status.component.css'
})
export class PaymentsStatusComponent implements OnInit {
  public startDate = this.getMonthStart();
  public endDate = this.getMonthEnd();
  public loading = false;
  public error = '';
  private expandedPayments = new Set<number>();
  private savingExpences = new Set<number>();

  private store = inject(entityStorage);
  private dialog = inject(MatDialog);

  public expences: Signal<Expences[]> = computed(() =>
    this.store.expencesEntities().filter(item => item.staff.length > 0)
  );

  public paidCount = computed(() =>
    this.expences().reduce((sum, item) => sum + item.staff.filter(staff => staff.payed).length, 0)
  );

  public unpaidCount = computed(() =>
    this.expences().reduce((sum, item) => sum + item.staff.filter(staff => !staff.payed).length, 0)
  );

  public paidTotal = computed(() =>
    this.expences().reduce((sum, item) => sum + item.staff.filter(staff => staff.payed).reduce((staffSum, staff) => staffSum + staff.price, 0), 0)
  );

  public unpaidTotal = computed(() =>
    this.expences().reduce((sum, item) => sum + item.staff.filter(staff => !staff.payed).reduce((staffSum, staff) => staffSum + staff.price, 0), 0)
  );

  constructor(private ordersService: OrdersService, private toast: HotToastService) {
  }

  ngOnInit(): void {
    this.loadStatuses();
  }

  loadStatuses(): void {
    if(!this.startDate || !this.endDate){
      this.error = 'Вкажіть початкову і кінцеву дату';
      return;
    }

    this.loading = true;
    this.error = '';

    this.ordersService.getExpences(this.startDate, this.endDate).subscribe({
      next: () => {
        this.loading = false;
      },
      error: err => {
        this.error = err.message ?? 'Не вдалося завантажити статуси оплат';
        this.loading = false;
      }
    });
  }

  getPaidTotal(item: Expences): number {
    return item.staff.filter(staff => staff.payed).reduce((sum, staff) => sum + staff.price, 0);
  }

  getUnpaidTotal(item: Expences): number {
    return item.staff.filter(staff => !staff.payed).reduce((sum, staff) => sum + staff.price, 0);
  }

  togglePaymentDetails(item: Expences): void {
    if (this.expandedPayments.has(item.id)) {
      this.expandedPayments.delete(item.id);
      return;
    }

    this.expandedPayments.add(item.id);
  }

  isPaymentExpanded(item: Expences): boolean {
    return this.expandedPayments.has(item.id);
  }

  isSaving(item: Expences): boolean {
    return this.savingExpences.has(item.id);
  }

  requestPaymentStatusChange(change: MatCheckboxChange, item: Expences, staffIndex: number): void {
    this.updatePaymentStatus(change, item, staffIndex, change.checked);
  }

  private updatePaymentStatus(change: MatCheckboxChange, item: Expences, staffIndex: number, payed: boolean): void {
    const currentStaff = item.staff[staffIndex];
    if (!currentStaff || this.isSaving(item)) {
      change.source.checked = currentStaff?.payed ?? false;
      return;
    }

    this.dialog.open(PaymentStatusConfirmDialogComponent, {
      data: {
        name: currentStaff.name || `Працівник #${currentStaff.staffId}`,
        nextStatus: payed,
      }
    }).afterClosed().subscribe(confirmed => {
      if (!confirmed) {
        change.source.checked = currentStaff.payed;
        return;
      }

      const updatedItem: Expences = {
        ...item,
        staff: item.staff.map((staff, index) =>
          index === staffIndex ? {...staff, payed} : staff
        )
      };

      this.replaceExpencesInStore(updatedItem);
      this.savingExpences.add(item.id);

      this.ordersService.editExpences(this.toExpencesRequest(updatedItem)).pipe(
        finalize(() => {
          this.savingExpences.delete(item.id);
        })
      ).subscribe({
        next: expences => {
          this.replaceExpencesInStore(expences);
        },
        error: err => {
          this.replaceExpencesInStore(item);
          this.toast.error(err.message ?? 'Не вдалося оновити статус оплати');
        }
      });
    });
  }

  getStaffTypeLabel(type: string | null): string {
    if (type === 'COOK') {
      return 'Кухар';
    }

    if (type === 'WAITER') {
      return 'Офіціант';
    }

    return 'Персонал';
  }

  formatDate(date: string | null): string {
    if(!date){
      return 'Без дати';
    }

    return new Date(date).toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  private getMonthStart(): string {
    const date = new Date();
    return this.toDateInputValue(new Date(date.getFullYear(), date.getMonth(), 1));
  }

  private getMonthEnd(): string {
    const date = new Date();
    return this.toDateInputValue(new Date(date.getFullYear(), date.getMonth() + 1, 0));
  }

  private toDateInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private toExpencesRequest(item: Expences): ExpencesRequest {
    return {
      id: item.id,
      menuId: item.menuId!,
      staff: item.staff.map(staff => ({
        staffId: staff.staffId!,
        price: staff.price,
        payed: staff.payed,
      })),
      otherExpences: item.otherExpences.map(expence => ({
        id: expence.id,
        name: expence.name,
        amount: expence.amount,
      })),
      shoppingSums: item.shoppingSums.map(shopping => ({
        id: shopping.id,
        name: shopping.name,
        date: shopping.date,
        sum: shopping.sum,
      })),
    };
  }

  private replaceExpencesInStore(item: Expences): void {
    this.store.setAllExpences(
      this.store.expencesEntities().map(expence => expence.id === item.id ? item : expence)
    );
  }
}
