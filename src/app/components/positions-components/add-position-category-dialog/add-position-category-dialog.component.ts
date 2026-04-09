import {Component, inject, model} from '@angular/core';
import {FormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatInput, MatLabel} from "@angular/material/input";
import {MatFormField} from "@angular/material/form-field";
import {
  AddCategoryDialogueData
} from "../../ingredients-components/add-category-dialogue/add-category-dialogue.component";

@Component({
  selector: 'app-add-position-category-dialog',
  imports: [
    FormsModule,
    MatButton,
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    MatFormField,
    MatInput,
    MatLabel,
    MatDialogClose
  ],
  templateUrl: './add-position-category-dialog.component.html',
  styleUrl: './add-position-category-dialog.component.css',
  standalone: true
})
export class AddPositionCategoryDialogComponent {
  readonly dialogue = inject(MatDialogRef<AddPositionCategoryDialogComponent>);
  readonly data = inject<AddCategoryDialogueData>(MAT_DIALOG_DATA);
  readonly name = model(this.data.name);

  onClose(){
    this.dialogue.close();
  }
}
