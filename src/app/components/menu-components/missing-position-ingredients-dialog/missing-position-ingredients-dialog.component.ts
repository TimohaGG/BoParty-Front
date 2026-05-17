import {Component, inject} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent} from '@angular/material/dialog';
import {MatButton} from '@angular/material/button';
import {MatIcon} from '@angular/material/icon';

export interface MissingPositionIngredientsDialogData {
  positions: string[];
}

@Component({
  selector: 'app-missing-position-ingredients-dialog',
  imports: [
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatIcon,
  ],
  templateUrl: './missing-position-ingredients-dialog.component.html',
  styleUrl: './missing-position-ingredients-dialog.component.css'
})
export class MissingPositionIngredientsDialogComponent {
  readonly data = inject<MissingPositionIngredientsDialogData>(MAT_DIALOG_DATA);
}
