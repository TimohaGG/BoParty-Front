import {Component, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatDialog} from "@angular/material/dialog";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize} from "rxjs";
import {Staff, StaffRequest, StaffType} from "../../../models/Waiters/Waiter";
import {StaffService} from "../../../_services/waiters.service";
import {WaiterDialogComponent} from "../waiter-dialog/waiter-dialog.component";

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

    this.staffService.getAll().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: data => {
        this.staff = data;
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося завантажити персонал');
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(WaiterDialogComponent);

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
      },
    });

    ref.afterClosed().subscribe((payload?: StaffRequest) => {
      if(!payload || (payload.name === staffItem.name && payload.type === staffItem.type)){
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
    return type === 'COOK' ? 'Кухар' : 'Офіціант';
  }
}
