import {Component, OnInit} from '@angular/core';
import {ShoppingList} from "../../../models/Menu/ShoppingList";
import {OrdersService} from "../../../_services/orders.service";
import {ActivatedRoute, RouterLink} from "@angular/router";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {ShoppingListItem} from "../../../models/Menu/ShoppingListItem";
import {MatDialog} from "@angular/material/dialog";
import {
  ShoppingCommentDialogComponent
} from "../shopping-comment-dialog/shopping-comment-dialog.component";
import {HotToastService} from "@ngxpert/hot-toast";
import {finalize} from "rxjs";
import {MatFabButton} from "@angular/material/button";
import {
  CreateShoppingItemDialogComponent,
  CreateShoppingItemPayload
} from "../create-shopping-item-dialog/create-shopping-item-dialog.component";

@Component({
  selector: 'app-shopping',
  imports: [
    MatIcon,
    MatProgressSpinner,
    RouterLink,
    MatFabButton
  ],
  templateUrl: './shopping.component.html',
  styleUrl: './shopping.component.css'
})
export class ShoppingComponent implements OnInit {
  public orderId:number = 0;
  public shoppingList:ShoppingList | null = null;
  public isLoading = true;
  public loadingFailure = false;
  public openCommentItemId: number | null = null;
  public commentLoadingItemId: number | null = null;
  public removingItemId: number | null = null;
  public addingItem = false;
  public deleteMode = false;

  constructor(private service:OrdersService, route:ActivatedRoute, private dialog:MatDialog, private toast:HotToastService) {
    if(route.snapshot.paramMap.has("orderId")){
      this.orderId = Number(route.snapshot.paramMap.get("orderId"));
    }
  }

  ngOnInit(): void {
    this.loadShoppingList();
  }

  private loadShoppingList(): void {
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

    console.log(this.shoppingList);
  }

  get items(): ShoppingListItem[] {
    return this.shoppingList?.items ?? [];
  }

  get boughtCount(): number {
    return this.items.filter(item => item.bought).length;
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

    item.loading = true;
    this.openCommentItemId = null;
    this.service.toggleShoppingItem(item.id,!item.bought).subscribe(
      result => {
        item.bought = !item.bought;
        item.loading = false;
      }
    );
  }

  hasComment(item: ShoppingListItem): boolean {
    return !!item.comment?.trim();
  }

  isCommentLoading(item: ShoppingListItem): boolean {
    return this.commentLoadingItemId === item.id;
  }

  toggleCommentPopup(item: ShoppingListItem): void {
    if(this.isCommentLoading(item)){
      return;
    }

    if(!this.hasComment(item)){
      this.openCommentDialog(item);
      return;
    }

    this.openCommentItemId = this.openCommentItemId === item.id ? null : item.id;
  }

  openCommentDialog(item: ShoppingListItem): void {
    this.openCommentItemId = null;
    const ref = this.dialog.open(ShoppingCommentDialogComponent, {
      data: {
        itemName: item.ingredient.name,
        comment: item.comment ?? '',
      },
      panelClass: 'shopping-comment-panel',
    });

    ref.afterClosed().subscribe((comment?: string) => {
      if(comment){
        this.commentLoadingItemId = item.id;
        this.service.addShoppingComment(item.id, comment).pipe(
          finalize(() => this.commentLoadingItemId = null)
        ).subscribe({
          next: () => {
            item.comment = comment;
          },
          error: (err) => {
            this.toast.error(err.message ?? "Не вдалося зберегти коментар");
          }
        });
      }
    });
  }

  deleteComment(item: ShoppingListItem): void {
    this.commentLoadingItemId = item.id;
    this.service.removeShoppingComment(item.id).pipe(
      finalize(() => this.commentLoadingItemId = null)
    ).subscribe({
      next: () => {
        item.comment = '';
        this.openCommentItemId = null;
      },
      error: (err) => {
        this.toast.error(err.message ?? "Не вдалося видалити коментар");
      }
    });
  }

  openCreateItemDialog(): void {
    if(!this.shoppingList || this.addingItem){
      return;
    }

    const ref = this.dialog.open(CreateShoppingItemDialogComponent, {
      data: {
        shoppingListId: this.shoppingList.id,
      },
    });

    ref.afterClosed().subscribe((payload?: CreateShoppingItemPayload) => {
      if(!payload){
        return;
      }

      this.addingItem = true;
      this.service.addShoppingItem(payload).pipe(
        finalize(() => this.addingItem = false)
      ).subscribe({
        next: (item) => {
          if(this.shoppingList){
            this.shoppingList.items = [
              ...this.shoppingList.items,
              this.normalizeShoppingItem(item as ShoppingListItem & {isBought?: boolean})
            ];
          }
        },
        error: (err) => {
          this.toast.error(err.message ?? "Не вдалося додати продукт");
        }
      });
    });
  }

  private normalizeShoppingItem(item: ShoppingListItem & {isBought?: boolean}): ShoppingListItem {
    return {
      ...item,
      bought: item.bought ?? item.isBought ?? false,
      comment: item.comment ?? '',
      loading: false,
    };
  }

  isRemovingItem(item: ShoppingListItem): boolean {
    return this.removingItemId === item.id;
  }

  removeShoppingItem(item: ShoppingListItem): void {
    if(this.isRemovingItem(item)){
      return;
    }

    this.openCommentItemId = null;
    this.removingItemId = item.id;
    this.service.removeShoppingItem(item.id).pipe(
      finalize(() => this.removingItemId = null)
    ).subscribe({
      next: () => {
        if(this.shoppingList){
          this.shoppingList.items = this.shoppingList.items.filter(listItem => listItem.id !== item.id);
        }
      },
      error: (err) => {
        this.toast.error(err.message ?? "Не вдалося видалити продукт");
      }
    });
  }

  toggleDeleteMode(): void {
    this.deleteMode = !this.deleteMode;
    this.openCommentItemId = null;
  }

  itemTrackBy(_index: number, item: ShoppingListItem): number {
    return item.id;
  }

  toggleShoppingItem(id: number, status:boolean): void {

  }

}

interface ShoppingGroup {
  name: string;
  items: ShoppingListItem[];
}
