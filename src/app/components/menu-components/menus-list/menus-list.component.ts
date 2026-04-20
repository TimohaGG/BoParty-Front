import {booleanAttribute, Component, computed, inject, OnInit, signal, Signal} from '@angular/core';
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
import {ActivatedRoute, Router, RouterLink} from "@angular/router";
import {MatPaginator, PageEvent} from "@angular/material/paginator";

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
    MatPaginator
  ],
  templateUrl: './menus-list.component.html',
  styleUrl: './menus-list.component.css'
})
export class MenusListComponent implements OnInit{

  private store = inject(entityStorage);
  public menus:Signal<MinMenu[]> = computed(this.store.minMenusEntities);


  public currentPage = computed(this.store.currentPage);
  public perPage = computed(this.store.pageSize);
  public totalPages = computed(this.store.ordersTotal);

  public loading:Signal<boolean> = computed(this.store.loading);

  public loadingFailure = false;
  public needsArchive:boolean;


  constructor(private orderService:OrdersService,
              private toast:HotToastService,
              private posCategoriesService:PositionsCategoryService,
  private router:ActivatedRoute,) {

    this.needsArchive = this.router.snapshot.queryParamMap.get("showArchive")=="true";
  }



  ngOnInit(): void {
    if(this.menus().length != 0)
      return;

    this.router.queryParams.subscribe((params) => {
      this.needsArchive = params['showArchive']=="true";
      this.getFutureAmount(this.needsArchive).subscribe(res=>{
        this.loadFutureOrders(this.needsArchive);
      });
    })
  }

  loadFutureOrders(archive:boolean) {
    this.orderService.getOfPageMin(this.perPage(), this.currentPage(), archive).subscribe({
        error: error=>{
          this.loadingFailure = true;
          this.toast.show(error.message,{duration:3000,position:"bottom-center",autoClose:true});
        }
      }
    );
  }

  getFutureAmount(archive:boolean) {
    return this.orderService.getOrdersAmount(archive);
  }

  onPageChange($event: PageEvent) {
    this.store.setCurrentPage($event.pageIndex);
    this.store.setPerPage($event.pageSize);
    this.loadFutureOrders(this.needsArchive);
  }




}
