import {Component, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatDialog} from "@angular/material/dialog";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize} from "rxjs";
import {Waiter} from "../../../models/Waiters/Waiter";
import {WaitersService} from "../../../_services/waiters.service";
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
  waiters: Waiter[] = [];
  loading = false;
  saving = false;
  deletingId: number | null = null;

  constructor(
    private waitersService: WaitersService,
    private dialog: MatDialog,
    private toast: HotToastService
  ) {
  }

  ngOnInit(): void {
    this.loadWaiters();
  }

  loadWaiters(): void {
    this.loading = true;

    this.waitersService.getAll().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: data => {
        this.waiters = data;
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося завантажити офіціантів');
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(WaiterDialogComponent);

    ref.afterClosed().subscribe((name?: string) => {
      if(!name){
        return;
      }

      this.saving = true;
      this.waitersService.create(name).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: waiter => {
          this.waiters = [...this.waiters, waiter];
          this.toast.success('Офіціанта додано');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося додати офіціанта');
        }
      });
    });
  }

  openEditDialog(waiter: Waiter): void {
    const ref = this.dialog.open(WaiterDialogComponent, {
      data: {
        waiter,
      },
    });

    ref.afterClosed().subscribe((name?: string) => {
      if(!name || name === waiter.name){
        return;
      }

      this.saving = true;
      this.waitersService.edit({id: waiter.id, name}).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: updated => {
          this.waiters = this.waiters.map(item => item.id === updated.id ? updated : item);
          this.toast.success('Офіціанта оновлено');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося оновити офіціанта');
        }
      });
    });
  }

  deleteWaiter(waiter: Waiter): void {
    if(!confirm(`Видалити офіціанта "${waiter.name}"?`)){
      return;
    }

    this.deletingId = waiter.id;
    this.waitersService.delete(waiter.id).pipe(
      finalize(() => this.deletingId = null)
    ).subscribe({
      next: id => {
        this.waiters = this.waiters.filter(item => item.id !== id);
        this.toast.success('Офіціанта видалено');
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося видалити офіціанта');
      }
    });
  }

  isDeleting(waiter: Waiter): boolean {
    return this.deletingId === waiter.id;
  }
}
