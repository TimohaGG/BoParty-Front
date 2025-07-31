import {Component, inject, model} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions, MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from "@angular/material/dialog";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-add-category-dialogue',
  imports: [
    MatLabel,
    MatFormField,
    MatInput,
    MatDialogActions,
    MatButton,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,
    MatDialogClose
  ],
  templateUrl: './add-category-dialogue.component.html',
  styleUrl: './add-category-dialogue.component.css',
  standalone: true
})


export class AddCategoryDialogueComponent {
  readonly dialogue = inject(MatDialogRef<AddCategoryDialogueComponent>);
  readonly data = inject<AddCategoryDialogueData>(MAT_DIALOG_DATA);
  readonly name = model(this.data.name);

  onClose(){
    this.dialogue.close();
  }

}

export interface AddCategoryDialogueData {
  name: string;
}

