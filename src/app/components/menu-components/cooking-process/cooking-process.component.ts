import {Component, computed, inject, OnInit, signal} from '@angular/core';
import {ActivatedRoute, RouterLink} from "@angular/router";
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatSelect, MatOption} from "@angular/material/select";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatIcon} from "@angular/material/icon";
import {NgOptimizedImage} from "@angular/common";
import {HotToastService} from "@ngxpert/hot-toast";
import {catchError, finalize, forkJoin, of} from "rxjs";
import {OrdersService} from "../../../_services/orders.service";
import {StaffService} from "../../../_services/waiters.service";
import {Menu} from "../../../models/Menu/Menu";
import {PositionAmountFull} from "../../../models/Positions/PositionAmountFull";
import {Staff} from "../../../models/Waiters/Waiter";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {MinPosAmount} from "../../../models/Positions/MinPosAmount";
import {MatDialog} from "@angular/material/dialog";
import {
  Expences,
  ExpencesRequest,
  ExpencesStaffRequest
} from "../../../models/Expences/Expences";
import {
  CookingProcessStatsDialogComponent,
  CookingProcessStatsDialogRow
} from "./cooking-process-stats-dialog.component";

type CookTotalRow = {
  cookId: number;
  cookName: string;
  total: number;
};

@Component({
  selector: 'app-cooking-process',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    MatButton,
    MatFormField,
    MatLabel,
    MatInput,
    MatSelect,
    MatOption,
    MatProgressSpinner,
    MatIcon,
    NgOptimizedImage
  ],
  templateUrl: './cooking-process.component.html',
  styleUrl: './cooking-process.component.css'
})
export class CookingProcessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly ordersService = inject(OrdersService);
  private readonly staffService = inject(StaffService);
  private readonly toast = inject(HotToastService);
  private readonly dialog = inject(MatDialog);

  readonly menu = signal<Menu | null>(null);
  readonly cooks = signal<Staff[]>([]);

  loading = false;
  saving = false;
  syncingStatistics = false;
  error = '';
  readonly payoutPercent = signal(10);
  readonly hasStatisticsEntry = signal(false);

  readonly totalWithoutServing = computed(() =>
    this.getMenuPositions().reduce((sum, item) => sum + this.getPositionTotal(item), 0)
  );

  readonly drinksTotal = computed(() =>
    this.getMenuPositions()
      .filter(item => this.isDrinksPosition(item))
      .reduce((sum, item) => sum + this.getPositionTotal(item), 0)
  );

  readonly cookTotals = computed<CookTotalRow[]>(() => {
    const cooksById = new Map(this.cooks().map(item => [item.id, item]));
    const totals = new Map<number, CookTotalRow>();

    this.getMenuPositions().forEach(item => {
      if (item.cookId == null) {
        return;
      }

      const existing = totals.get(item.cookId) ?? {
        cookId: item.cookId,
        cookName: cooksById.get(item.cookId)?.name ?? `Кухар #${item.cookId}`,
        total: 0,
      };

      existing.total += this.getPositionTotal(item);
      totals.set(item.cookId, existing);
    });

    return Array.from(totals.values()).sort((a, b) => a.cookName.localeCompare(b.cookName, 'uk-UA'));
  });

  readonly cookPayouts = computed(() => {
    const percent = this.getPayoutPercent();
    return this.cookTotals().map(item => ({
      ...item,
      payout: Math.round(item.total * percent) / 100
    }));
  });

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    const orderId = Number(this.route.snapshot.paramMap.get('orderId'));
    if (!Number.isFinite(orderId) || orderId <= 0) {
      this.error = 'Некоректний ідентифікатор замовлення';
      return;
    }

    this.loading = true;
    this.error = '';

    forkJoin({
      menu: this.ordersService.getById(orderId),
      staff: this.staffService.getAll()
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({menu, staff}) => {
        if (isMessage(menu)) {
          this.error = (menu as ExceptionMessage).message ?? 'Не вдалося завантажити меню';
          return;
        }

        const loadedMenu = menu as Menu;
        this.menu.set({
          ...loadedMenu,
          positions: [...loadedMenu.positions].sort((a, b) => a.inMenuOrder - b.inMenuOrder)
        });
        this.cooks.set(staff.filter(item => item.type === 'COOK').sort((a, b) => a.name.localeCompare(b.name, 'uk-UA')));
        this.loadStatisticsStatus(loadedMenu);
      },
      error: err => {
        this.error = err.message ?? 'Не вдалося завантажити процес кухні';
      }
    });
  }

  save(): void {
    const currentMenu = this.menu();
    if (!currentMenu) {
      return;
    }

    const items = currentMenu.positions.map(item => {
      const payload = new MinPosAmount(item.position.id, item.amount, item.title ?? '');
      payload.inMenuOrder = item.inMenuOrder;
      payload.cookId = item.cookId ?? null;
      return payload;
    });

    const value = {
      date: currentMenu.date,
      client: currentMenu.client,
      guestsAmount: currentMenu.guestsAmount,
      duration: currentMenu.duration,
      format: currentMenu.format,
      phoneNumber: currentMenu.phone,
      deliveryType: currentMenu.deliveryType,
      deliveryAddress: currentMenu.deliveryAddress,
      orderType: currentMenu.orderType,
      needsWaiter: currentMenu.needsWaiter,
      serving: currentMenu.serving,
      taxAmount: currentMenu.taxAmount,
      govTax: currentMenu.govTax,
      govTaxAmount: currentMenu.govTaxAmount,
    };

    this.saving = true;
    this.ordersService.editOrder(currentMenu.id, value, items, currentMenu.additionalInfo).pipe(
      finalize(() => this.saving = false)
    ).subscribe({
      next: updated => {
        this.menu.set({
          ...updated,
          positions: [...updated.positions].sort((a, b) => a.inMenuOrder - b.inMenuOrder)
        });
        this.toast.success('Процес кухні збережено');
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося зберегти процес кухні');
      }
    });
  }

  updateCook(inMenuOrder: number, cookId: number | null): void {
    this.menu.update(currentMenu => {
      if (!currentMenu) {
        return currentMenu;
      }

      return {
        ...currentMenu,
        positions: currentMenu.positions.map(item =>
          item.inMenuOrder === inMenuOrder
            ? {...item, cookId}
            : item
        )
      };
    });
  }

  updatePayoutPercent(value: string | number | null): void {
    this.payoutPercent.set(Number(value));
  }

  openStatisticsDialog(): void {
    const rows = this.cookPayouts()
      .filter(item => item.payout > 0)
      .map<CookingProcessStatsDialogRow>(item => ({
        staffId: item.cookId,
        name: item.cookName,
        amount: this.roundToHundreds(item.payout),
      }));

    if (rows.length === 0) {
      this.toast.error('Немає сум для додавання в статистику');
      return;
    }

    this.dialog.open(CookingProcessStatsDialogComponent, {
      data: {rows},
      width: '560px',
      maxWidth: 'calc(100vw - 24px)'
    }).afterClosed().subscribe((payload?: CookingProcessStatsDialogRow[]) => {
      if (!payload?.length) {
        return;
      }

      this.syncCookSumsToStatistics(payload);
    });
  }

  getPositionTotal(item: PositionAmountFull): number {
    return item.position.price * item.amount;
  }

  formatDate(date: string | null | undefined): string {
    if (!date) {
      return 'Без дати';
    }

    return new Date(date).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  private getMenuPositions(): PositionAmountFull[] {
    return this.menu()?.positions ?? [];
  }

  private isDrinksPosition(item: PositionAmountFull): boolean {
    return item.position.category?.name?.trim().toLowerCase() === 'напої';
  }

  private loadStatisticsStatus(currentMenu: Menu): void {
    const menuDate = this.getDatePart(currentMenu.date);
    if (!menuDate) {
      this.hasStatisticsEntry.set(false);
      return;
    }

    this.ordersService.getExpences(menuDate, menuDate).pipe(
      catchError(() => of([] as Expences[]))
    ).subscribe(expences => {
      this.hasStatisticsEntry.set(expences.some(item => item.menuId === currentMenu.id));
    });
  }

  private getPayoutPercent(): number {
    const parsed = Number(this.payoutPercent());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  }

  private syncCookSumsToStatistics(rows: CookingProcessStatsDialogRow[]): void {
    const currentMenu = this.menu();
    if (!currentMenu) {
      return;
    }

    const menuDate = this.getDatePart(currentMenu.date);
    this.syncingStatistics = true;

    this.ordersService.getExpences(menuDate, menuDate).pipe(
      catchError(() => of([] as Expences[]))
    ).subscribe({
      next: expences => {
        const currentExpences = expences.find(item => item.menuId === currentMenu.id);
        const payload = this.buildStatisticsPayload(currentMenu, currentExpences, rows);
        const request$ = currentExpences
          ? this.ordersService.editExpences(payload)
          : this.ordersService.createExpences(payload);

        request$.pipe(
          finalize(() => this.syncingStatistics = false)
        ).subscribe({
          next: saved => {
            const currentStore = this.ordersService.store.expencesEntities();
            const hasSame = currentStore.some(item => item.id === saved.id);

            this.ordersService.store.setAllExpences(
              hasSame
                ? currentStore.map(item => item.id === saved.id ? saved : item)
                : [saved, ...currentStore]
            );

            this.hasStatisticsEntry.set(true);
            this.toast.success(currentExpences ? 'Суми кухарів оновлено в статистиці' : 'Суми кухарів додано в статистику');
          },
          error: err => {
            this.toast.error(err.message ?? 'Не вдалося додати суми в статистику');
          }
        });
      },
      error: () => {
        this.syncingStatistics = false;
      }
    });
  }

  private buildStatisticsPayload(currentMenu: Menu, currentExpences: Expences | undefined, rows: CookingProcessStatsDialogRow[]): ExpencesRequest {
    const cookRows = rows
      .filter(item => item.amount > 0)
      .map<ExpencesStaffRequest>(item => ({
        staffId: item.staffId,
        price: this.roundToHundreds(item.amount),
        payed: currentExpences?.staff.find(staff => staff.staffId === item.staffId)?.payed ?? false,
      }));

    const otherStaff = (currentExpences?.staff ?? [])
      .filter(item => item.type !== 'COOK')
      .map<ExpencesStaffRequest>(item => ({
        staffId: item.staffId!,
        price: item.price,
        payed: item.payed,
      }));

    return {
      id: currentExpences?.id,
      menuId: currentMenu.id,
      staff: [...otherStaff, ...cookRows],
      shoppingSums: (currentExpences?.shoppingSums ?? []).map(item => ({
        id: item.id,
        name: item.name,
        date: item.date,
        sum: item.sum,
      })),
      otherExpences: (currentExpences?.otherExpences ?? []).map(item => ({
        id: item.id,
        name: item.name,
        amount: item.amount,
      })),
    };
  }

  private getDatePart(date: string | null | undefined): string {
    return date ? date.slice(0, 10) : '';
  }

  private roundToHundreds(value: number): number {
    return Math.round((Number(value) || 0) / 100) * 100;
  }
}
