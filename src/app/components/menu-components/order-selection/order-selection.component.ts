import {Component, computed, EventEmitter, inject, OnInit, Output, signal, Signal, WritableSignal} from '@angular/core';
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {Position} from "../../../models/Positions/Position";
import {Category} from "../../../models/Positions/Category";
import {SelectedOrderPosition} from "../../../models/Orders/SelectedOrderPosition";
import {PositionsCategoryService} from "../../../_services/positions-category.service";
import {OrdersService} from "../../../_services/orders.service";
import {StorageService} from "../../../_services/storage.service";
import {HotToastService} from "@ngxpert/hot-toast";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatDialog} from "@angular/material/dialog";
import {
  OrderCheckoutData,
  OrderCheckoutDialogComponent,
  OrderCheckoutDialogResult
} from "../order-checkout-dialog/order-checkout-dialog.component";

export interface OrderSelectionSubmitEvent {
  positions: SelectedOrderPosition[];
  checkout: OrderCheckoutData;
}

@Component({
  selector: 'app-order-selection',
  imports: [
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatProgressSpinner,
    MatButton,
    MatIcon,
    MatIconButton
  ],
  templateUrl: './order-selection.component.html',
  styleUrl: './order-selection.component.css'
})
export class OrderSelectionComponent implements OnInit {
  @Output() submitSelection = new EventEmitter<OrderSelectionSubmitEvent>();

  private readonly store = inject(entityStorage);
  private readonly categoriesService = inject(PositionsCategoryService);
  private readonly ordersService = inject(OrdersService);
  private readonly userStorage = inject(StorageService);
  private readonly toast = inject(HotToastService);
  private readonly dialog = inject(MatDialog);

  readonly categories:Signal<Category[]> = computed(this.store.positionCategoriesEntities);
  readonly orderPositions:Signal<Position[]> = computed(() => this.store.orderPositionsEntities());
  readonly selectedItems:Signal<SelectedOrderPosition[]> = computed(() => this.store.selectedOrderPositionsEntities());

  public selectedCategory:FormControl = new FormControl(0);
  public filteredPositions:WritableSignal<Position[] | null> = signal(null);
  public isLoading = true;
  private loadedCategoryIds = new Set<number>();

  get userCategories():Category[]{
    return this.categories().filter(category => category.userId == this.userStorage.getUser().id);
  }

  ngOnInit(): void {
    this.store.hydrateSelectedOrderPositions();
    this.categoriesService.getAllForUsers().subscribe({
      next: data => {
        if(!isMessage(data)) {
          this.selectedCategory.setValue((data as Category[]).at(0)?.id);
          if(this.orderPositions().filter(position => position.category.id == this.selectedCategory.value).length == 0){
            this.loadPositions((data as Category[]).at(0)!.id);
          }
          else{
            this.filterCategories();
          }
        }
      },
      error: error => {
        this.toast.error(error.message, {duration:3000, position:"bottom-center", autoClose:true});
        this.isLoading = false;
      }
    });
  }

  filterCategories(): void {
    this.isLoading = true;
    const categoryId = this.selectedCategory.value;

    const categoryPositions = this.orderPositions().filter(position => position.category.id === categoryId);
    if(categoryPositions.length > 0){
      this.loadedCategoryIds.add(categoryId);
    }

    if(!this.loadedCategoryIds.has(categoryId)){
      this.loadPositions(categoryId);
      return;
    }

    this.filteredPositions.set(categoryPositions);
    this.isLoading = false;
  }

  openCategory(categoryId:number | null, showLoader = false): void {
    if(categoryId === null){
      this.filteredPositions.set([]);
      this.isLoading = false;
      return;
    }

    this.selectedCategory.setValue(categoryId, {emitEvent: false});
    if(showLoader){
      this.isLoading = true;
    }
    this.filterCategories();
  }

  increaseAmount(position:Position): void {
    const current = this.getSelectedAmount(position.id);
    this.store.setSelectedOrderPosition({
      id: position.id,
      amount: current == 0 ? position.minimumAmount : current + 1,
      position
    });
  }

  decreaseAmount(positionId:number): void {
    const current = this.selectedItems().find(item => item.id === positionId);
    if(!current){
      return;
    }
    let position = this.orderPositions().find(item => item.id === positionId);
    if(!position){
      return;
    }
    if(current.amount <= position.minimumAmount || current.amount <= 1){
      this.store.removeSelectedOrderPosition(positionId);
      return;
    }
    this.store.setSelectedOrderPosition({
      ...current,
      amount: current.amount - 1
    });
  }

  removeFromSelected(positionId:number): void {
    this.store.removeSelectedOrderPosition(positionId);
  }

  onAmountInput(position:Position, event:Event): void {
    const target = event.target as HTMLInputElement;
    const value = Number(target.value);
    if(value < position.minimumAmount){
      this.toast.error("Мінімальна к-сть: " + position.minimumAmount);
      target.value = "";
      this.store.removeSelectedOrderPosition(position.id);
      return;
    }

    if(!Number.isFinite(value) || value <= 0){
      this.store.removeSelectedOrderPosition(position.id);
      target.value = "";
      return;
    }

    this.store.setSelectedOrderPosition({
      id: position.id,
      amount: Math.floor(value),
      position
    });
  }

  getSelectedAmount(positionId:number): number {
    return this.selectedItems().find(item => item.id === positionId)?.amount ?? 0;
  }

  isSelected(positionId:number): boolean {
    return this.getSelectedAmount(positionId) > 0;
  }

  submit(): void {
    const positions = this.selectedItems().filter(item => item.amount > 0);
    if (positions.length === 0) {
      this.toast.error("Оберіть хоча б одну позицію", {duration: 3000, position: "bottom-center", autoClose: true});
      return;
    }

    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const dialogRef = this.dialog.open(OrderCheckoutDialogComponent, {
      data: {positions},
      ...(isMobile ? {
        width: "100vw",
        maxWidth: "100vw",
        height: "100dvh",
        maxHeight: "100dvh",
        panelClass: "full-screen",
      } : {
        width: "min(760px, calc(100vw - 32px))",
        maxWidth: "calc(100vw - 32px)",
        panelClass: "order-checkout-panel",
      }),
    });

    dialogRef.afterClosed().subscribe((result: OrderCheckoutDialogResult | undefined) => {
      if (result) {
        this.submitSelection.emit(result);
      }
    });
  }

  trackByPosition(index:number, item:Position): number {
    return item.id;
  }

  private loadPositions(categoryId:number): void {
    this.isLoading = true;
    this.ordersService.getOrderPositionsByCategory(categoryId).subscribe({
      next: response => {
        if(isMessage(response)){
          this.handleMessage(response as ExceptionMessage);
          return;
        }

        this.loadedCategoryIds.add(categoryId);
        if(this.selectedCategory.value === categoryId){
          this.filteredPositions.set(this.orderPositions().filter(position => position.category.id === categoryId));
          this.isLoading = false;
        }
      },
      error: error => {
        this.toast.error(error.message, {duration:3000, position:"bottom-center", autoClose:true});
        this.isLoading = false;
      }
    });
  }

  private handleMessage(message:ExceptionMessage): void {
    this.toast.error(message.message, {duration:3000, position:"bottom-center", autoClose:true});
    this.isLoading = false;
  }
}
