import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatButton} from "@angular/material/button";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HotToastService} from "@ngxpert/hot-toast";
import {Position} from "../../../models/Positions/Position";
import {PositionsService} from "../../../_services/positions.service";
import {isMessage} from "../../../models/Exceptions/ExceptionMessage";

@Component({
  selector: 'app-archive-position-dialog',
  imports: [
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatProgressSpinner
  ],
  templateUrl: './archive-position-dialog.component.html',
  styleUrl: './archive-position-dialog.component.css'
})
export class ArchivePositionDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ArchivePositionDialogComponent>);
  readonly data = inject<ArchivePositionDialogData>(MAT_DIALOG_DATA);

  public loading = false;

  constructor(private service: PositionsService, private toast: HotToastService) {
  }

  onSubmit(): void {
    this.loading = true;
    this.service.archivePosition(this.data.position.id).subscribe({
      next: response => {
        this.loading = false;
        if (isMessage(response)) {
          this.toast.error((response as any).message, {duration: 3000, position: "bottom-center", autoClose: true});
          return;
        }

        this.toast.success("Позицію переміщено в архів", {duration: 2200, position: "bottom-center", autoClose: true});
        this.dialogRef.close(this.data.position.id);
      },
      error: error => {
        this.loading = false;
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

export interface ArchivePositionDialogData {
  position: Position;
}
