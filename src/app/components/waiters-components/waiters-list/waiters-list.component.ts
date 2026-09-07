import {Component, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatDialog} from "@angular/material/dialog";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize, forkJoin} from "rxjs";
import {Staff, StaffCategory, StaffRequest, StaffType} from "../../../models/Waiters/Waiter";
import {StaffService} from "../../../_services/waiters.service";
import {WaiterDialogComponent} from "../waiter-dialog/waiter-dialog.component";
import {StaffCategoryDialogComponent} from "../staff-category-dialog/staff-category-dialog.component";

type StaffGroup = {
  category: StaffCategory;
  staff: Staff[];
};

@Component({
  selector: 'app-waiters-list',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './waiters-list.component.html',
  styleUrl: './waiters-list.component.css'
})
export class WaitersListComponent implements OnInit {
  staff: Staff[] = [];
  categories: StaffCategory[] = [];
  loading = false;
  saving = false;
  deletingId: number | null = null;

  constructor(
    private staffService: StaffService,
    private dialog: MatDialog,
    private toast: HotToastService
  ) {
  }

  ngOnInit(): void {
    this.loadStaff();
  }

  loadStaff(): void {
    this.loading = true;

    forkJoin({
      staff: this.staffService.getAll(),
      categories: this.staffService.getCategories(),
    }).pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: ({staff, categories}) => {
        this.staff = staff;
        this.categories = categories;
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося завантажити персонал');
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(WaiterDialogComponent, {
      data: {
        categories: this.categories,
      },
    });

    ref.afterClosed().subscribe((payload?: StaffRequest) => {
      if(!payload){
        return;
      }

      this.saving = true;
      this.staffService.create(payload).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: staffItem => {
          this.staff = [...this.staff, staffItem];
          this.toast.success('Працівника додано');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося додати працівника');
        }
      });
    });
  }

  openEditDialog(staffItem: Staff): void {
    const ref = this.dialog.open(WaiterDialogComponent, {
      data: {
        waiter: staffItem,
        categories: this.categories,
      },
    });

    ref.afterClosed().subscribe((payload?: StaffRequest) => {
      if(!payload || (payload.name === staffItem.name && payload.type === staffItem.type && payload.cookPercent === staffItem.cookPercent)){
        return;
      }

      this.saving = true;
      this.staffService.edit({id: staffItem.id, ...payload}).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: updated => {
          this.staff = this.staff.map(item => item.id === updated.id ? updated : item);
          this.toast.success('Працівника оновлено');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося оновити працівника');
        }
      });
    });
  }

  deleteWaiter(staffItem: Staff): void {
    if(!confirm(`Видалити працівника "${staffItem.name}"?`)){
      return;
    }

    this.deletingId = staffItem.id;
    this.staffService.delete(staffItem.id).pipe(
      finalize(() => this.deletingId = null)
    ).subscribe({
      next: id => {
        this.staff = this.staff.filter(item => item.id !== id);
        this.toast.success('Працівника видалено');
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося видалити працівника');
      }
    });
  }

  isDeleting(staffItem: Staff): boolean {
    return this.deletingId === staffItem.id;
  }

  getStaffTypeLabel(type: StaffType): string {
    return this.categories.find(item => item.code === type)?.name ?? (type === 'COOK' ? 'Кухарі' : 'Офіціанти');
  }

  getStaffGroups(): StaffGroup[] {
    const groups = this.categories.map(category => ({
      category,
      staff: this.staff
        .filter(item => item.type === category.code)
        .sort((a, b) => a.name.localeCompare(b.name, 'uk-UA')),
    }));
    const knownCodes = new Set(this.categories.map(item => item.code));
    const missingGroups = Array.from(new Set(this.staff.filter(item => !knownCodes.has(item.type)).map(item => item.type)))
      .map(code => ({
        category: {id: null, name: code, code},
        staff: this.staff.filter(item => item.type === code).sort((a, b) => a.name.localeCompare(b.name, 'uk-UA')),
      }));

    return [...groups, ...missingGroups];
  }

  openCreateCategoryDialog(): void {
    const ref = this.dialog.open(StaffCategoryDialogComponent);

    ref.afterClosed().subscribe((name?: string) => {
      if (!name) {
        return;
      }

      this.saving = true;
      this.staffService.createCategory(name).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: category => {
          this.categories = [...this.categories, category];
          this.toast.success('Категорію персоналу додано');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося додати категорію персоналу');
        }
      });
    });
  }
}
