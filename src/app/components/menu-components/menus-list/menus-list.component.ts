import {Component, computed, inject, OnInit, Signal} from '@angular/core';
import {MenusListItemComponent} from "../menus-list-item/menus-list-item.component";
import {MatButton, MatFabButton} from "@angular/material/button";
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";
import {MatIcon} from "@angular/material/icon";
import {MinMenu} from "../../../models/Menu/MinMenu";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {OrdersService} from "../../../_services/orders.service";
import {of} from "rxjs";
import {HotToastService} from "@ngxpert/hot-toast";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {Category} from "../../../models/Positions/Category";
import {PositionsCategoryService} from "../../../_services/positions-category.service";
import {Menu} from "../../../models/Menu/Menu";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-orders-list',
  imports: [
    MenusListItemComponent,
    MatMenuTrigger,
    MatMenu,
    MatMenuItem,
    MatIcon,
    MatProgressSpinner,
    MatFabButton,
    RouterLink,
  ],
  templateUrl: './menus-list.component.html',
  styleUrl: './menus-list.component.css'
})
export class MenusListComponent implements OnInit{

  private store = inject(entityStorage);
  public menus:Signal<MinMenu[]> = computed(this.store.minMenusEntities);

  public loading:Signal<boolean> = computed(this.store.loading);

  public loadingFailure = false;


  constructor(private orderService:OrdersService,
              private toast:HotToastService,
              private posCategoriesService:PositionsCategoryService) {
  }



  ngOnInit(): void {
    if(this.menus().length == 0){
      console.log("Getting orders list");
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
