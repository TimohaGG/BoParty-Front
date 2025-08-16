import {Component, Input} from '@angular/core';
import {MatFabButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MinOrder} from "../../../models/Orders/MinOrder";
import {DatePipe} from "@angular/common";
import {RouterLink, RouterLinkActive} from "@angular/router";
import {Order} from "../../../models/Orders/Order";

@Component({
  selector: 'app-orders-list-item',
  imports: [
    MatFabButton,
    MatIcon,
    DatePipe,
    RouterLink,
    RouterLinkActive
  ],
  templateUrl: './orders-list-item.component.html',
  styleUrl: './orders-list-item.component.css'
})
export class OrdersListItemComponent {

  @Input() order?:Order;

}
