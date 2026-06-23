import {Component, computed, inject, OnInit, signal, Signal} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {FormsModule} from "@angular/forms";
import {MatInput} from "@angular/material/input";
import {MatIcon} from "@angular/material/icon";
import {MatButton, MatIconButton} from "@angular/material/button";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {MatDialog} from "@angular/material/dialog";
import {Expences, ExpencesRequest} from "../../../models/Expences/Expences";
import {OrdersService} from "../../../_services/orders.service";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ExpencesDialogComponent} from "../expences-dialog/expences-dialog.component";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize} from "rxjs";
import {MinMenu} from "../../../models/Menu/MinMenu";

@Component({
  selector: 'app-order-list-component',
  imports: [
    MatFormField,
    MatLabel,
    FormsModule,
    MatInput,
    MatIcon,
    MatIconButton,
    MatButton,
    MatProgressSpinner
  ],
  templateUrl: './order-list.component.html',
  styleUrl: './order-list.component.css',
  standalone: true,
})
export class OrderListComponent implements OnInit {
  public startDate = this.getMonthStart();
  public endDate = this.getMonthEnd();
  public loading = false;
  public saving = false;
  public deletingId: number | null = null;
  public error = '';
  public summaryCollapsed = true;
  private expandedExpences = new Set<number>();

  private dialog = inject(MatDialog);
  private store = inject(entityStorage);
  private menus = signal<MinMenu[]>([]);

  public expences: Signal<Expences[]> = computed(this.store.expencesEntities);

  public totalIncome = computed(() =>
    this.expences().reduce((sum, item) => sum + this.getIncome(item), 0)
  );

  public totalCook = computed(() =>
    this.expences().reduce((sum, item) => sum + (item.cook ?? 0), 0)
  );

  public totalShopping = computed(() =>
    this.expences().reduce((sum, item) => sum + this.getShoppingTotal(item), 0)
  );

  public totalWaiters = computed(() =>
    this.expences().reduce((sum, item) => sum + this.getWaitersTotal(item), 0)
  );

  public totalOther = computed(() =>
    this.expences().reduce((sum, item) => sum + this.getOtherTotal(item), 0)
  );

  public totalExpences = computed(() =>
    this.totalShopping() + this.totalCook() + this.totalWaiters() + this.totalOther()
  );

  constructor(private ordersService: OrdersService, private toast: HotToastService) {
  }

  ngOnInit(): void {
    this.loadMenus();
    this.loadExpences();
  }

  private loadMenus(): void {
    this.ordersService.getCurrentUserOrderOptions().subscribe({
      next: menus => {
        this.menus.set(menus);
      },
      error: () => {
        this.menus.set([]);
      }
    });
  }

  loadExpences(): void {
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
      error: (err) => {
        this.error = err.message ?? 'Не вдалося завантажити витрати';
        this.loading = false;
      }
    });
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(ExpencesDialogComponent, {
      data: {
        startDate: this.startDate,
        endDate: this.endDate,
        usedMenuIds: this.getUsedMenuIds(),
      },
    });

    dialogRef.afterClosed().subscribe((payload?: ExpencesRequest) => {
      if(!payload){
        return;
      }

      this.saving = true;
      this.ordersService.createExpences(payload).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: expences => {
          this.storeExpences([expences, ...this.expences().filter(item => item.id !== expences.id)]);
          this.toast.success('Витрати додано');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося додати витрати');
        }
      });
    });
  }

  openEditDialog(expences: Expences): void {
    const dialogRef = this.dialog.open(ExpencesDialogComponent, {
      data: {
        expences,
        startDate: this.startDate,
        endDate: this.endDate,
        usedMenuIds: this.getUsedMenuIds(),
      },
    });

    dialogRef.afterClosed().subscribe((payload?: ExpencesRequest) => {
      if(!payload){
        return;
      }

      this.saving = true;
      this.ordersService.editExpences(payload).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: updated => {
          this.storeExpences(this.expences().map(item => item.id === updated.id ? updated : item));
          this.toast.success('Витрати оновлено');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося оновити витрати');
        }
      });
    });
  }

  deleteExpences(expences: Expences): void {
    if(!confirm(`Видалити витрати для "${expences.client || 'меню #' + expences.menuId}"?`)){
      return;
    }

    this.deletingId = expences.id;
    this.ordersService.deleteExpences(expences.id).pipe(
      finalize(() => this.deletingId = null)
    ).subscribe({
      next: id => {
        this.storeExpences(this.expences().filter(item => item.id !== id));
        this.toast.success('Витрати видалено');
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося видалити витрати');
      }
    });
  }

  isDeleting(expences: Expences): boolean {
    return this.deletingId === expences.id;
  }

  toggleSummary(): void {
    this.summaryCollapsed = !this.summaryCollapsed;
  }

  toggleExpenceDetails(expences: Expences): void {
    if(this.expandedExpences.has(expences.id)){
      this.expandedExpences.delete(expences.id);
      return;
    }

    this.expandedExpences.add(expences.id);
  }

  isExpenceExpanded(expences: Expences): boolean {
    return this.expandedExpences.has(expences.id);
  }

  getIncome(item: Expences): number {
    if(!item.menuId){
      return 0;
    }

    return (this.menus().find(menu => menu.id === item.menuId)?.totalPrice ?? 0) - this.getExpenceTotal(item);
  }

  getSum(item: Expences): number {
    if(!item.menuId){
      return 0;
    }

    return (this.menus().find(menu => menu.id === item.menuId)?.totalPrice ?? 0);
  }

  getWaitersTotal(item: Expences): number {
    return (item.waiters ?? []).reduce((sum, waiter) => sum + (waiter.price ?? 0), 0);
  }

  getShoppingTotal(item: Expences): number {
    return (item.shoppingSums ?? []).reduce((sum, shopping) => sum + (shopping.sum ?? 0), 0);
  }

  getOtherTotal(item: Expences): number {
    return (item.otherExpences ?? []).reduce((sum, expence) => sum + (expence.amount ?? 0), 0);
  }

  getExpenceTotal(item: Expences): number {
    return this.getShoppingTotal(item) + (item.cook ?? 0) + this.getWaitersTotal(item) + this.getOtherTotal(item);
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

  private storeExpences(items: Expences[]): void {
    this.store.setAllExpences(items);
  }

  private getUsedMenuIds(): number[] {
    return this.expences()
      .map(item => item.menuId)
      .filter((menuId): menuId is number => menuId !== null);
  }
}
