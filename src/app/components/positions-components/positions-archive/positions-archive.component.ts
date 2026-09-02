import {Component, OnInit, signal} from '@angular/core';
import {MatIconButton} from "@angular/material/button";
import {MatDialog} from "@angular/material/dialog";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HotToastService} from "@ngxpert/hot-toast";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {Position} from "../../../models/Positions/Position";
import {PositionsService} from "../../../_services/positions.service";
import {DeletePositionsDialogComponent} from "../delete-positions-dialog/delete-positions-dialog.component";

@Component({
  selector: 'app-positions-archive',
  imports: [
    MatIconButton,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './positions-archive.component.html',
  styleUrl: './positions-archive.component.css'
})
export class PositionsArchiveComponent implements OnInit {
  public positions = signal<Position[]>([]);
  public isLoading = true;
  public restoringIds = signal<number[]>([]);

  constructor(
    private positionsService: PositionsService,
    private dialog: MatDialog,
    private toast: HotToastService
  ) {
  }

  ngOnInit(): void {
    this.loadArchive();
  }

  restorePosition(position: Position): void {
    if (this.isRestoring(position.id)) {
      return;
    }

    this.restoringIds.update(ids => [...ids, position.id]);
    this.positionsService.restorePosition(position.id).subscribe({
      next: response => {
        this.restoringIds.update(ids => ids.filter(id => id !== position.id));
        if (isMessage(response)) {
          this.toast.error((response as ExceptionMessage).message, {duration: 3000, position: "bottom-center", autoClose: true});
          return;
        }

        this.positions.update(items => items.filter(item => item.id !== position.id));
        this.toast.success("Позицію відновлено", {duration: 2200, position: "bottom-center", autoClose: true});
      },
      error: error => {
        this.restoringIds.update(ids => ids.filter(id => id !== position.id));
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
  }

  openDeleteModal(position: Position): void {
    const ref = this.dialog.open(DeletePositionsDialogComponent, {
      data: {
        position
      }
    });

    ref.afterClosed().subscribe(result => {
      if(result){
        this.positions.update(items => items.filter(item => item.id !== result));
      }
    });
  }

  isRestoring(positionId: number): boolean {
    return this.restoringIds().includes(positionId);
  }

  trackByPosition(index: number, position: Position): number {
    return position.id;
  }

  private loadArchive(): void {
    this.isLoading = true;
    this.positionsService.getArchived().subscribe({
      next: response => {
        if (isMessage(response)) {
          this.positions.set([]);
          this.isLoading = false;
          return;
        }

        this.positions.set((response as Position[]).slice().sort((a, b) => a.name.localeCompare(b.name, 'uk')));
        this.isLoading = false;
      },
      error: error => {
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        this.isLoading = false;
      }
    });
  }
}
