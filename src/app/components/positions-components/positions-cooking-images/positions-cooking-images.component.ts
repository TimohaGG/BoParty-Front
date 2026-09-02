import {Component, computed, inject, OnInit, signal, Signal, WritableSignal} from '@angular/core';
import {FormControl, ReactiveFormsModule} from "@angular/forms";
import {MatButton} from "@angular/material/button";
import {MatButtonToggle, MatButtonToggleGroup} from "@angular/material/button-toggle";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HotToastService} from "@ngxpert/hot-toast";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {Category} from "../../../models/Positions/Category";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {Position} from "../../../models/Positions/Position";
import {PositionsCategoryService} from "../../../_services/positions-category.service";
import {PositionsService} from "../../../_services/positions.service";
import {StorageService} from "../../../_services/storage.service";

@Component({
  selector: 'app-positions-cooking-images',
  imports: [
    ReactiveFormsModule,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatButton,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './positions-cooking-images.component.html',
  styleUrl: './positions-cooking-images.component.css'
})
export class PositionsCookingImagesComponent implements OnInit {
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
  public uploadingIds = signal<number[]>([]);

  get userCategories(): Category[] {
    return this.categories()
      .slice()
      .sort((a, b) => (a.sortingOrder ?? Number.MAX_SAFE_INTEGER) - (b.sortingOrder ?? Number.MAX_SAFE_INTEGER));
  }

  ngOnInit(): void {
    if (this.userCategories.length > 0) {
      this.loadPositions();
      return;
    }

    this.categoriesService.getAll().subscribe({
      next: response => {
        if (isMessage(response)) {
          this.toast.error((response as ExceptionMessage).message, {duration: 3000, position: "bottom-center", autoClose: true});
        }
        this.loadPositions();
      },
      error: error => {
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        this.isLoading = false;
      }
    });
  }

  filterPositions(): void {
    const categoryId = this.selectedCategory.value;
    const positions = this.positions()
      .filter(position => categoryId === 0 || position.category.id === categoryId)
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name, 'uk'));

    this.filteredPositions.set(positions);
  }

  onCookingImageSelected(position: Position, event: Event): void {
    const input = event.target as HTMLInputElement;
    const image = input.files?.[0] ?? null;
    input.value = '';

    if (!image || this.isUploading(position.id)) {
      return;
    }

    this.uploadingIds.update(ids => [...ids, position.id]);
    this.positionsService.updateCookingImage(position.id, image).subscribe({
      next: response => {
        this.uploadingIds.update(ids => ids.filter(id => id !== position.id));
        if (isMessage(response)) {
          this.toast.error((response as ExceptionMessage).message, {duration: 3000, position: "bottom-center", autoClose: true});
          return;
        }

        const updatedPosition = response as Position;
        this.filteredPositions.update(items =>
          items?.map(item => item.id === updatedPosition.id ? updatedPosition : item) ?? items
        );
        this.toast.success("Фото готування збережено", {duration: 2000, position: "bottom-center", autoClose: true});
      },
      error: error => {
        this.uploadingIds.update(ids => ids.filter(id => id !== position.id));
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
      }
    });
  }

  isUploading(positionId: number): boolean {
    return this.uploadingIds().includes(positionId);
  }

  trackByPosition(index: number, item: Position): number {
    return item.id;
  }

  private loadPositions(): void {
    this.isLoading = true;
    this.positionsService.getAll().subscribe({
      next: response => {
        if (isMessage(response)) {
          this.toast.error((response as ExceptionMessage).message, {duration: 3000, position: "bottom-center", autoClose: true});
          this.filteredPositions.set([]);
          this.isLoading = false;
          return;
        }

        this.filterPositions();
        this.isLoading = false;
      },
      error: error => {
        this.toast.error(error.message, {duration: 3000, position: "bottom-center", autoClose: true});
        this.isLoading = false;
      }
    });
  }
}
