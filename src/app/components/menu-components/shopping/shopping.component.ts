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
import {finalize, forkJoin, of} from "rxjs";
import {MatFabButton} from "@angular/material/button";
import {
  CreateShoppingItemDialogComponent,
  CreateShoppingItemPayload
} from "../create-shopping-item-dialog/create-shopping-item-dialog.component";
import {
  MissingPositionIngredientsDialogComponent
} from "../missing-position-ingredients-dialog/missing-position-ingredients-dialog.component";
import {PositionAmountFull} from "../../../models/Positions/PositionAmountFull";
import {IngredientAmount} from "../../../models/Positions/IngredientAmount";

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
  public openCommentGroupKey: string | null = null;
  public openUsageGroupKey: string | null = null;
  public commentLoadingGroupKey: string | null = null;
  public removingGroupKey: string | null = null;
  public addingItem = false;
  public deleteMode = false;
  public selectedPositionId: number | string | null = null;
  public shoppingSidebarOpen = false;
  private missingIngredientsWarningShown = false;

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
        this.isLoading = false;
        this.showMissingIngredientsWarning();
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

  get shoppingPositions(): PositionAmountFull[] {
    return this.shoppingList?.positions ?? [];
  }

  getShoppingPositionData(item: PositionAmountFull) {
    return item?.position;
  }

  getShoppingPositionId(item: PositionAmountFull): number | string | null {
    return this.getShoppingPositionData(item)?.id ?? item?.inMenuOrder ?? null;
  }

  getShoppingPositionName(item: PositionAmountFull): string {
    if(item?.title?.trim()){
      return item.title;
    }

    return this.getShoppingPositionData(item)?.name ?? item?.title ?? 'Позиція';
  }

  getShoppingPositionImage(item: PositionAmountFull): string {
    return this.getShoppingPositionData(item)?.imgUrl ?? '';
  }

  getShoppingPositionMeta(item: PositionAmountFull): string {
    const data = this.getShoppingPositionData(item);
    const parts: string[] = [];

    if(data?.weight){
      parts.push(`${data.weight} г`);
    }

    if(item?.amount){
      parts.push(`${item.amount} порц.`);
    }

    return parts.join(' · ');
  }

  getShoppingPositionIngredients(item: PositionAmountFull): IngredientAmount[] {
    return this.getShoppingPositionData(item)?.ingredients ?? [];
  }

  getShoppingPositionIngredientAmountLabel(item: PositionAmountFull, ingredient: IngredientAmount): string {
    const positionAmount = item?.amount ?? 0;
    const totalAmount = ingredient.amount * positionAmount;
    const unit = ingredient.unit ?? '';

    return `${this.formatAmount(totalAmount)} ${unit}`.trim();
  }

  getShoppingPositionIngredientCalculationLabel(item: PositionAmountFull, ingredient: IngredientAmount): string {
    const positionAmount = item?.amount ?? 0;
    const unit = ingredient.unit ?? '';

    return `${this.formatAmount(ingredient.amount)} ${unit} × ${positionAmount}`.trim();
  }

  private showMissingIngredientsWarning(): void {
    if(this.missingIngredientsWarningShown){
      return;
    }

    const missingPositions = this.shoppingPositions
      .filter(position => this.getShoppingPositionIngredients(position).length === 0)
      .map(position => this.getShoppingPositionName(position));

    if(missingPositions.length === 0){
      return;
    }

    this.missingIngredientsWarningShown = true;
    this.dialog.open(MissingPositionIngredientsDialogComponent, {
      data: {
        positions: missingPositions,
      },
      panelClass: 'missing-position-ingredients-panel',
    });
  }

  isShoppingPositionOpen(item: PositionAmountFull): boolean {
    return this.selectedPositionId === this.getShoppingPositionId(item);
  }

  toggleShoppingPosition(item: PositionAmountFull): void {
    const id = this.getShoppingPositionId(item);
    this.selectedPositionId = this.selectedPositionId === id ? null : id;
  }

  get boughtCount(): number {
    return this.flatIngredientGroups.filter(group => group.bought).length;
  }

  get remainingCount(): number {
    return this.flatIngredientGroups.length - this.boughtCount;
  }

  get progressPercent(): number {
    if(this.flatIngredientGroups.length === 0){
      return 0;
    }

    return Math.round((this.boughtCount / this.flatIngredientGroups.length) * 100);
  }

  get groupedItems(): ShoppingGroup[] {
    const usageMap = this.buildUsageMap();
    const categoryMap = new Map<string, Map<string, ShoppingIngredientGroup>>();

    for (const item of this.items) {
      const categoryName = item.ingredient.category?.name ?? "Без категорії";
      const ingredientKey = this.getIngredientGroupKey(item);
      const categoryGroups = categoryMap.get(categoryName) ?? new Map<string, ShoppingIngredientGroup>();
      const existingGroup = categoryGroups.get(ingredientKey);

      if(existingGroup){
        existingGroup.items.push(item);
      } else {
        categoryGroups.set(ingredientKey, {
          key: ingredientKey,
          ingredient: item.ingredient,
          items: [item],
          amountDisplay: '',
          bought: false,
          usage: usageMap.get(ingredientKey) ?? [],
        });
      }

      categoryMap.set(categoryName, categoryGroups);
    }

    return [...categoryMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right, 'uk'))
      .map(([name, groups]) => ({
        name,
        items: [...groups.values()]
          .map(group => ({
            ...group,
            amountDisplay: this.buildAmountDisplay(group.items),
            bought: group.items.every(item => item.bought),
          }))
          .sort((left, right) => left.ingredient.name.localeCompare(right.ingredient.name, 'uk'))
      }));
  }

  get flatIngredientGroups(): ShoppingIngredientGroup[] {
    return this.groupedItems.flatMap(group => group.items);
  }

  toggleBought(group: ShoppingIngredientGroup): void {
    if(group.items.length === 0){
      return;
    }

    const nextStatus = !group.bought;
    group.items.forEach(item => item.loading = true);
    this.openCommentGroupKey = null;
    this.openUsageGroupKey = null;

    forkJoin(group.items.map(item => this.service.toggleShoppingItem(item.id, nextStatus))).subscribe({
      next: () => {
        group.items.forEach(item => {
          item.bought = nextStatus;
          item.loading = false;
        });
      },
      error: (err) => {
        group.items.forEach(item => item.loading = false);
        this.toast.error(err.message ?? "Не вдалося оновити статус продукту");
      }
    });
  }

  hasComment(group: ShoppingIngredientGroup): boolean {
    return group.items.some(item => !!item.comment?.trim());
  }

  isCommentLoading(group: ShoppingIngredientGroup): boolean {
    return this.commentLoadingGroupKey === group.key;
  }

  isRemovingItem(group: ShoppingIngredientGroup): boolean {
    return this.removingGroupKey === group.key;
  }

  isGroupLoading(group: ShoppingIngredientGroup): boolean {
    return group.items.some(item => item.loading);
  }

  toggleCommentPopup(group: ShoppingIngredientGroup): void {
    if(this.isCommentLoading(group)){
      return;
    }

    this.openUsageGroupKey = null;

    if(!this.hasComment(group)){
      this.openCommentDialog(group);
      return;
    }

    this.openCommentGroupKey = this.openCommentGroupKey === group.key ? null : group.key;
  }

  toggleUsagePopup(group: ShoppingIngredientGroup): void {
    this.openCommentGroupKey = null;
    this.openUsageGroupKey = this.openUsageGroupKey === group.key ? null : group.key;
  }

  getUsageSummary(group: ShoppingIngredientGroup): string {
    if(group.usage.length === 0){
      return 'Немає використання';
    }

    return `${group.usage.length} позицій`;
  }

  getCommentLines(group: ShoppingIngredientGroup): string[] {
    const commentedItems = group.items.filter(item => !!item.comment?.trim());

    if(commentedItems.length <= 1){
      return commentedItems.map(item => item.comment.trim());
    }

    return commentedItems.map(item => `${this.formatAmount(item.amount)} ${item.unitName}: ${item.comment.trim()}`);
  }

  openCommentDialog(group: ShoppingIngredientGroup): void {
    this.openCommentGroupKey = null;
    const ref = this.dialog.open(ShoppingCommentDialogComponent, {
      data: {
        itemName: group.ingredient.name,
        comment: this.getInitialCommentValue(group),
      },
      panelClass: 'shopping-comment-panel',
    });

    ref.afterClosed().subscribe((comment?: string) => {
      if(comment){
        this.commentLoadingGroupKey = group.key;
        forkJoin(group.items.map(item => this.service.addShoppingComment(item.id, comment))).pipe(
          finalize(() => this.commentLoadingGroupKey = null)
        ).subscribe({
          next: () => {
            group.items.forEach(item => item.comment = comment);
          },
          error: (err) => {
            this.toast.error(err.message ?? "Не вдалося зберегти коментар");
          }
        });
      }
    });
  }

  deleteComment(group: ShoppingIngredientGroup): void {
    const commentedItems = group.items.filter(item => !!item.comment?.trim());

    if(commentedItems.length === 0){
      this.openCommentGroupKey = null;
      return;
    }

    this.commentLoadingGroupKey = group.key;
    forkJoin(commentedItems.map(item => this.service.removeShoppingComment(item.id))).pipe(
      finalize(() => this.commentLoadingGroupKey = null)
    ).subscribe({
      next: () => {
        group.items.forEach(item => item.comment = '');
        this.openCommentGroupKey = null;
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

  removeShoppingItem(group: ShoppingIngredientGroup): void {
    if(this.isRemovingItem(group)){
      return;
    }

    this.openCommentGroupKey = null;
    this.openUsageGroupKey = null;
    this.removingGroupKey = group.key;

    forkJoin(group.items.map(item => this.service.removeShoppingItem(item.id))).pipe(
      finalize(() => this.removingGroupKey = null)
    ).subscribe({
      next: () => {
        if(this.shoppingList){
          const idsToRemove = new Set(group.items.map(item => item.id));
          this.shoppingList.items = this.shoppingList.items.filter(listItem => !idsToRemove.has(listItem.id));
        }
      },
      error: (err) => {
        this.toast.error(err.message ?? "Не вдалося видалити продукт");
      }
    });
  }

  toggleDeleteMode(): void {
    this.deleteMode = !this.deleteMode;
    this.openCommentGroupKey = null;
    this.openUsageGroupKey = null;
  }

  toggleShoppingSidebar(): void {
    this.shoppingSidebarOpen = !this.shoppingSidebarOpen;
  }

  closeShoppingSidebar(): void {
    this.shoppingSidebarOpen = false;
  }

  private getIngredientGroupKey(item: ShoppingListItem): string {
    return String(item.ingredient.id);
  }

  private buildAmountDisplay(items: ShoppingListItem[]): string {
    const unitMap = new Map<string, number>();

    for (const item of items) {
      const unitName = item.unitName?.trim() || 'од.';
      unitMap.set(unitName, (unitMap.get(unitName) ?? 0) + item.amount);
    }

    return [...unitMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right, 'uk'))
      .map(([unitName, amount]) => `${this.formatAmount(amount)} ${unitName}`)
      .join(' + ');
  }

  private buildUsageMap(): Map<string, ShoppingIngredientUsage[]> {
    const usageMap = new Map<string, ShoppingIngredientUsage[]>();

    for (const positionAmount of this.shoppingPositions) {
      const position = this.getShoppingPositionData(positionAmount);
      const positionName = this.getShoppingPositionName(positionAmount);
      const orderAmount = positionAmount.amount ?? 0;

      for (const ingredientAmount of position?.ingredients ?? []) {
        const key = String(ingredientAmount.ingredient.id);
        const totalAmount = ingredientAmount.amount * orderAmount;
        const usage = usageMap.get(key) ?? [];

        usage.push({
          positionName,
          totalAmountLabel: `${this.formatAmount(totalAmount)} ${ingredientAmount.unit ?? ''}`.trim(),
          calculationLabel: `${this.formatAmount(ingredientAmount.amount)} ${ingredientAmount.unit ?? ''} × ${orderAmount}`.trim(),
        });

        usageMap.set(key, usage);
      }
    }

    for (const [key, usages] of usageMap.entries()) {
      usageMap.set(
        key,
        usages.sort((left, right) => left.positionName.localeCompare(right.positionName, 'uk'))
      );
    }

    return usageMap;
  }

  private getInitialCommentValue(group: ShoppingIngredientGroup): string {
    const comments = group.items
      .map(item => item.comment?.trim() ?? '')
      .filter(comment => comment.length > 0);

    if(comments.length === 0){
      return '';
    }

    const firstComment = comments[0];
    return comments.every(comment => comment === firstComment) ? firstComment : '';
  }

  private formatAmount(value: number): string {
    if(Number.isInteger(value)){
      return `${value}`;
    }

    return value.toFixed(2).replace(/\.?0+$/, '');
  }
}

interface ShoppingGroup {
  name: string;
  items: ShoppingIngredientGroup[];
}

interface ShoppingIngredientGroup {
  key: string;
  ingredient: ShoppingListItem['ingredient'];
  items: ShoppingListItem[];
  amountDisplay: string;
  bought: boolean;
  usage: ShoppingIngredientUsage[];
}

interface ShoppingIngredientUsage {
  positionName: string;
  totalAmountLabel: string;
  calculationLabel: string;
}
