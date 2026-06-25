import {Component, OnInit} from '@angular/core';
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize} from "rxjs";
import {BoxesService} from "../../../_services/boxes.service";
import {Box} from "../../../models/Boxes/Box";
import {BoxDialogComponent} from "../box-dialog/box-dialog.component";
import {BoxRequest} from "../../../models/Boxes/Box";

@Component({
  selector: 'app-boxes-list',
  imports: [
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './boxes-list.component.html',
  styleUrl: './boxes-list.component.css'
})
export class BoxesListComponent implements OnInit {
  boxes: Box[] = [];
  loading = false;
  saving = false;
  deletingId: number | null = null;

  constructor(
    private readonly boxesService: BoxesService,
    private readonly dialog: MatDialog,
    private readonly toast: HotToastService
  ) {
  }

  ngOnInit(): void {
    this.loadBoxes();
  }

  loadBoxes(): void {
    this.loading = true;
    this.boxesService.getAll().pipe(
      finalize(() => this.loading = false)
    ).subscribe({
      next: boxes => {
        this.boxes = boxes;
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося завантажити бокси');
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialog.open(BoxDialogComponent, {
      width: 'min(980px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'order-checkout-panel',
    });

    ref.afterClosed().subscribe((result?: BoxRequest) => {
      if(!result){
        return;
      }

      this.saving = true;
      this.boxesService.create(result).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: box => {
          this.boxes = [box, ...this.boxes];
          this.toast.success('Бокс додано');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося додати бокс');
        }
      });
    });
  }

  openEditDialog(box: Box): void {
    const ref = this.dialog.open(BoxDialogComponent, {
      width: 'min(980px, calc(100vw - 32px))',
      maxWidth: 'calc(100vw - 32px)',
      panelClass: 'order-checkout-panel',
      data: {box}
    });

    ref.afterClosed().subscribe((result?: BoxRequest) => {
      if(!result){
        return;
      }

      this.saving = true;
      this.boxesService.edit(result).pipe(
        finalize(() => this.saving = false)
      ).subscribe({
        next: updated => {
          this.boxes = this.boxes.map(item => item.id === updated.id ? updated : item);
          this.toast.success('Бокс оновлено');
        },
        error: err => {
          this.toast.error(err.message ?? 'Не вдалося оновити бокс');
        }
      });
    });
  }

  deleteBox(box: Box): void {
    if(!confirm(`Видалити бокс #${box.id}?`)){
      return;
    }

    this.deletingId = box.id;
    this.boxesService.delete(box.id).pipe(
      finalize(() => this.deletingId = null)
    ).subscribe({
      next: id => {
        this.boxes = this.boxes.filter(item => item.id !== id);
        this.toast.success('Бокс видалено');
      },
      error: err => {
        this.toast.error(err.message ?? 'Не вдалося видалити бокс');
      }
    });
  }

  isDeleting(box: Box): boolean {
    return this.deletingId === box.id;
  }
}
