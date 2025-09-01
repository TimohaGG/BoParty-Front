import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {OrdersListItemComponent} from "../orders-list-item/orders-list-item.component";
import {MatButton, MatFabButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {MinOrder} from "../../../models/Orders/MinOrder";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {OrdersService} from "../../../_services/orders.service";
import {of} from "rxjs";
import {HotToastService} from "@ngxpert/hot-toast";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {Category} from "../../../models/Positions/Category";
import {PositionsCategoryService} from "../../../_services/positions-category.service";
import {Order} from "../../../models/Orders/Order";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-orders-list',
  imports: [
    OrdersListItemComponent,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatIcon,
    MatProgressSpinner,
    MatFabButton,
    RouterLink,
  ],
  templateUrl: './orders-list.component.html',
  styleUrl: './orders-list.component.css'
})
export class OrdersListComponent implements OnInit{

  private store = inject(entityStorage);
  public orders:Signal<MinOrder[]> = computed(this.store.minOrdersEntities);

  public loading:Signal<boolean> = computed(this.store.loading);

  public loadingFailure = false;


  constructor(private orderService:OrdersService,
              private toast:HotToastService,
              private posCategoriesService:PositionsCategoryService) {
  }



  ngOnInit(): void {
    if(this.orders().length == 0){
      this.orderService.getAllMin().subscribe({
          error: error=>{
            this.loadingFailure = true;
            this.toast.show(error.message,{duration:3000,position:"bottom-center",autoClose:true});
          }
        }
      );
    }



  }




}
