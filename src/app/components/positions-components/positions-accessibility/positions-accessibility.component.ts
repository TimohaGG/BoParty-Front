import {Component, computed, inject, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {MatSlideToggleModule} from "@angular/material/slide-toggle";
import {HotToastService} from "@ngxpert/hot-toast";
import {forkJoin, of} from "rxjs";
import {catchError} from "rxjs/operators";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {Category} from "../../../models/Positions/Category";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {Position} from "../../../models/Positions/Position";
import {PositionsCategoryService} from "../../../_services/positions-category.service";
import {PositionsService} from "../../../_services/positions.service";
import {StorageService} from "../../../_services/storage.service";

@Component({
  selector: 'app-positions-accessibility',
  imports: [
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatButton,
    MatProgressSpinner,
    MatIcon,
    MatSlideToggleModule
  ],
  templateUrl: './positions-accessibility.component.html',
  styleUrl: './positions-accessibility.component.css'
})
export class PositionsAccessibilityComponent implements OnInit {
  private readonly store = inject(entityStorage);
  private readonly categoriesService = inject(PositionsCategoryService);
  private readonly positionsService = inject(PositionsService);
  private readonly userStorage = inject(StorageService);
  private readonly toast = inject(HotToastService);

  readonly categories: Signal<Category[]> = computed(this.store.positionCategoriesEntities);
  readonly positions: Signal<Position[]> = computed(() => this.store.positionsEntities());

  public selectedCategory: FormControl = new FormControl(0);
  public filteredPositions: WritableSignal<Position[] | null> = signal(null);
  public isLoading = true;
  public updatingIds = signal<number[]>([]);
  public bulkUpdating = signal(false);
  private loadedCategoryIds = new Set<number>();

  get userCategories(): Category[] {
    const userId = this.userStorage.getUser()?.id;
    return this.categories()
      .filter(category => category.userId == userId)
      .slice()
      .sort((a, b) => (a.sortingOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortingOrder ?? Number.MAX_SAFE_INTEGER));
  }

  get currentCategoryPositions(): Position[] {
    return this.filteredPositions() ?? [];
  }

  get canEnableAll(): boolean {
    return this.currentCategoryPositions.some(position => !position.accessible);
  }

  get canDisableAll(): boolean {
    return this.currentCategoryPositions.some(position => position.accessible);
  }

  ngOnInit(): void {
    if (this.userCategories.length > 0) {
      this.initWithCategories();
      return;
    }

    this.categoriesService.getAll().subscribe({
      next: data => {
        if (!isMessage(data)) {
          this.initWithCategories();
        }
      },
      error: error => {
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        this.isLoading = false;
      }
    });
  }

  filterCategories(): void {
    this.isLoading = true;
    const categoryId = this.selectedCategory.value;
    const categoryPositions = this.positions().filter(position => position.category.id === categoryId);

    if (categoryPositions.length > 0) {
      this.loadedCategoryIds.add(categoryId);
    }

    if (!this.loadedCategoryIds.has(categoryId)) {
      this.loadPositions(categoryId);
      return;
    }

    this.filteredPositions.set(categoryPositions);
    this.isLoading = false;
  }

  toggleAccessibility(position: Position, enabled: boolean): void {
    if (this.isUpdating(position.id) || position.accessible === enabled) {
      return;
    }

    this.updatingIds.update(ids => [...ids, position.id]);
    this.positionsService.updateAccessibility(position.id, enabled).subscribe({
      next: response => {
        this.updatingIds.update(ids => ids.filter(id => id !== position.id));
        if (isMessage(response)) {
          this.toast.error((response as ExceptionMessage).message, {duration: 3000, position: "bottom-center", autoClose: true});
          return;
        }

        const updatedPosition = {...position, accessible: enabled};
        this.store.addPosition(updatedPosition);
        this.filteredPositions.update(items =>
          items?.map(item => item.id === position.id ? updatedPosition : item) ?? items
        );
        this.toast.success(enabled ? "Позицію відкрито" : "Позицію приховано", {duration: 2000, position: "bottom-center", autoClose: true});
      },
      error: error => {
        this.updatingIds.update(ids => ids.filter(id => id !== position.id));
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
  }

  toggleCategoryAccessibility(enabled: boolean): void {
    if (this.bulkUpdating()) {
      return;
    }

    const positionsToUpdate = this.currentCategoryPositions.filter(position => position.accessible !== enabled);
    if (positionsToUpdate.length === 0) {
      return;
    }

    this.bulkUpdating.set(true);
    this.updatingIds.update(ids => [...ids, ...positionsToUpdate.map(position => position.id)]);

    forkJoin(
      positionsToUpdate.map(position =>
        this.positionsService.updateAccessibility(position.id, enabled).pipe(
          catchError(() => of(new ExceptionMessage("Помилка", 500)))
        )
      )
    ).subscribe({
      next: responses => {
        const failedIds = new Set<number>();

        positionsToUpdate.forEach((position, index) => {
          const response = responses[index];
          if (isMessage(response)) {
            failedIds.add(position.id);
            return;
          }

          this.store.addPosition({...position, accessible: enabled});
        });

        this.filteredPositions.update(items =>
          items?.map(item => failedIds.has(item.id) ? item : {...item, accessible: enabled}) ?? items
        );

        this.updatingIds.update(ids => ids.filter(id => !positionsToUpdate.some(position => position.id === id)));
        this.bulkUpdating.set(false);

        if (failedIds.size > 0) {
          this.toast.error("Не вдалося оновити всі позиції", {duration: 3000, position: "bottom-center", autoClose: true});
          return;
        }

        this.toast.success(enabled ? "Усі позиції в категорії відкрито" : "Усі позиції в категорії приховано", {
          duration: 2000,
          position: "bottom-center",
          autoClose: true
        });
      },
      error: error => {
        this.updatingIds.update(ids => ids.filter(id => !positionsToUpdate.some(position => position.id === id)));
        this.bulkUpdating.set(false);
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
  }

  isUpdating(positionId: number): boolean {
    return this.updatingIds().includes(positionId);
  }

  trackByPosition(index: number, item: Position): number {
    return item.id;
  }

  private loadPositions(categoryId: number): void {
    this.isLoading = true;
    this.positionsService.getByCategory(categoryId).subscribe({
      next: response => {
        if (isMessage(response)) {
          this.handleMessage(response as ExceptionMessage);
          return;
        }

        this.loadedCategoryIds.add(categoryId);
        if (this.selectedCategory.value === categoryId) {
          this.filteredPositions.set(this.positions().filter(position => position.category.id === categoryId));
          this.isLoading = false;
        }
      },
      error: error => {
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        this.isLoading = false;
      }
    });
  }

  private handleMessage(message: ExceptionMessage): void {
    this.toast.error(message.message, {duration: 3000, position: "bottom-center", autoClose: true});
    this.isLoading = false;
  }

  private initWithCategories(): void {
    const firstCategory = this.userCategories.at(0);
    if (!firstCategory) {
      this.filteredPositions.set([]);
      this.isLoading = false;
      return;
    }

    this.selectedCategory.setValue(firstCategory.id);
    const existingPositions = this.positions().filter(position => position.category.id === firstCategory.id);
    if (existingPositions.length === 0) {
      this.loadPositions(firstCategory.id);
      return;
    }

    this.loadedCategoryIds.add(firstCategory.id);
    this.filteredPositions.set(existingPositions);
    this.isLoading = false;
  }
}
