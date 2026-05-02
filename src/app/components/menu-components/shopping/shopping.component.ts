import {Component, OnInit} from '@angular/core';
import {ShoppingList} from "../../../models/Menu/ShoppingList";
import {OrdersService} from "../../../_services/orders.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ShoppingListItem} from "../../../models/Menu/ShoppingListItem";

@Component({
  selector: 'app-shopping',
  imports: [
    MatIcon,
    MatProgressSpinner,
    RouterLink
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css'
})
export class ShoppingComponent implements OnInit {
  public orderId:number = 0;
  public shoppingList:ShoppingList | null = null;
  public isLoading = true;
  public loadingFailure = false;

  constructor(private service:OrdersService, route:ActivatedRoute) {
    if(route.snapshot.paramMap.has("orderId")){
      this.orderId = Number(route.snapshot.paramMap.get("orderId"));
    }
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadingFailure = false;

    this.service.getShoppingList(this.orderId).subscribe({
      next: (data) => {
        this.shoppingList = data;
        console.log(data);
        this.isLoading = false;
      },
      error: () => {
        this.loadingFailure = true;
        this.isLoading = false;
      }
    });
  }

  get items(): ShoppingListItem[] {
    return this.shoppingList?.items ?? [];
  }

  get boughtCount(): number {
    return this.items.filter(item => item.isBought).length;
  }

  get remainingCount(): number {
    return this.items.length - this.boughtCount;
  }

  get progressPercent(): number {
    if(this.items.length === 0){
      return 0;
    }

    return Math.round((this.boughtCount / this.items.length) * 100);
  }

  get groupedItems(): ShoppingGroup[] {
    const map = new Map<string, ShoppingListItem[]>();

    for (const item of this.items) {
      const categoryName = item.ingredient.category?.name ?? "Без категорії";
      map.set(categoryName, [...(map.get(categoryName) ?? []), item]);
    }

    return [...map.entries()].map(([name, items]) => ({name, items}));
  }

  toggleBought(item: ShoppingListItem): void {
    item.isBought = !item.isBought;
  }

  itemTrackBy(_index: number, item: ShoppingListItem): number {
    return item.id;
  }

}

interface ShoppingGroup {
  name: string;
  items: ShoppingListItem[];
}
