import {Component, inject} from '@angular/core';
import {MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef} from "@angular/material/dialog";
import {MatInput, MatLabel} from "@angular/material/input";
import {MatFormField} from "@angular/material/form-field";
import {MatButton} from "@angular/material/button";
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-add-header-dialog',
  imports: [
    MatDialogContent,
    MatFormField,
    MatInput,
    MatLabel,
    MatDialogActions,
    MatButton,
    MatDialogClose,
    FormsModule
  ],
  templateUrl: './add-header-dialog.component.html',
  styleUrl: './add-header-dialog.component.css'
})
export class AddHeaderDialogComponent {
  readonly dialogRef =inject(MatDialogRef<AddHeaderDialogComponent>);
  public title:string = "";

  public addHeader(){
    if(this.title!=="")
      this.dialogRef.close(this.title);
  }

}
