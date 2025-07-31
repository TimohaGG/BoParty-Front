import {Component, Input} from '@angular/core';
import {MatFabButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {Position} from "../../../models/Positions/Position";

@Component({
  selector: 'app-positions-list-item',
  imports: [
    MatFabButton,
    MatIcon,
    MatIconButton,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem
  ],
  templateUrl: './positions-list-item.component.html',
  styleUrl: './positions-list-item.component.css'
})
export class PositionsListItemComponent {
  @Input() position?:Position;

}
