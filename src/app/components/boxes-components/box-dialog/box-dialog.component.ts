import {Component, inject, OnInit} from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef
} from "@angular/material/dialog";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {MatButton, MatIconButton} from "@angular/material/button";
import {MatIcon} from "@angular/material/icon";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HotToastService} from "@ngxpert/hot-toast";
import {Position} from "../../../models/Positions/Position";
import {Box, BoxAdditionalService, BoxRequest} from "../../../models/Boxes/Box";
import {AddMenuPositionDialogComponent} from "../../menu-components/add-menu-position-dialog/add-menu-position-dialog.component";

interface BoxDialogData {
  box?: Box;
}

interface SelectedBoxPosition {
  position: Position;
  amount: number;
}

@Component({
  selector: 'app-box-dialog',
  imports: [
    MatDialogContent,
    MatDialogClose,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatIcon,
    MatProgressSpinner
  ],
  templateUrl: './box-dialog.component.html',
  styleUrl: './box-dialog.component.css'
})
export class BoxDialogComponent implements OnInit {
  readonly data = inject<BoxDialogData>(MAT_DIALOG_DATA, {optional: true}) ?? {};
  private readonly dialogRef = inject(MatDialogRef<BoxDialogComponent, BoxRequest>);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(HotToastService);

  readonly form = new FormGroup({
    name: new FormControl(this.data.box?.name ?? '', [Validators.required]),
    description: new FormControl(this.data.box?.description ?? ''),
    serviceText: new FormControl(''),
    servicePrice: new FormControl<number | null>(null),
  });

  selectedPositions: SelectedBoxPosition[] = [];
  additionalServices: BoxAdditionalService[] = [];
  saving = false;

  ngOnInit(): void {
    if(this.data.box){
      this.selectedPositions = this.data.box.positions.map(item => ({
        position: item.position,
        amount: item.amount
      }));
      this.additionalServices = [...(this.data.box.additionalServices ?? [])];
    }
  }

  get totalPrice(): number {
    const positionsTotal = this.selectedPositions.reduce((sum, item) => sum + (item.position.price * item.amount), 0);
    const servicesTotal = this.additionalServices.reduce((sum, item) => sum + item.price, 0);
    return positionsTotal + servicesTotal;
  }

  openPositionPicker(): void {
    const selected = this.selectedPositions.map(item => item.position);
    const isMobile = window.matchMedia('(max-width: 720px)').matches;
    const ref = this.dialog.open(AddMenuPositionDialogComponent, {
      data: {positions: selected},
      ...(isMobile ? {
        width: "100vw",
        maxWidth: "100vw",
        height: "100dvh",
        maxHeight: "100dvh",
        panelClass: "full-screen",
      } : {
        width: "min(1120px, calc(100vw - 32px))",
        maxWidth: "calc(100vw - 32px)",
      }),
    });

    ref.afterClosed().subscribe((positions?: Position[]) => {
      if(!positions){
        return;
      }

      const nextPositions = positions.map(position => {
        const existing = this.selectedPositions.find(item => item.position.id === position.id);
        return {
          position,
          amount: existing?.amount ?? position.minimumAmount ?? 1
        };
      });

      this.selectedPositions = nextPositions;
    });
  }

  increase(positionId: number): void {
    this.selectedPositions = this.selectedPositions.map(item =>
      item.position.id === positionId
        ? {...item, amount: item.amount + 1}
        : item
    );
  }

  decrease(positionId: number): void {
    const current = this.selectedPositions.find(item => item.position.id === positionId);
    if(!current){
      return;
    }

    if(current.amount <= current.position.minimumAmount || current.amount <= 1){
      this.remove(positionId);
      return;
    }

    this.selectedPositions = this.selectedPositions.map(item =>
      item.position.id === positionId
        ? {...item, amount: item.amount - 1}
        : item
    );
  }

  updateAmount(position: Position, event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    if(!Number.isFinite(value) || value <= 0){
      this.remove(position.id);
      return;
    }

    const nextAmount = Math.max(position.minimumAmount || 1, Math.floor(value));
    this.selectedPositions = this.selectedPositions.map(item =>
      item.position.id === position.id
        ? {...item, amount: nextAmount}
        : item
    );
  }

  remove(positionId: number): void {
    this.selectedPositions = this.selectedPositions.filter(item => item.position.id !== positionId);
  }

  addAdditionalService(): void {
    const text = this.form.controls.serviceText.value?.trim() ?? '';
    const rawPrice = this.form.controls.servicePrice.value;
    const price = rawPrice === null ? NaN : Number(rawPrice);

    if(!text){
      this.toast.error('Введіть назву додаткової послуги');
      return;
    }

    if(!Number.isFinite(price) || price < 0){
      this.toast.error('Вкажіть коректну вартість послуги');
      return;
    }

    this.additionalServices = [
      ...this.additionalServices,
      {text, price: Math.floor(price)}
    ];

    this.form.controls.serviceText.setValue('');
    this.form.controls.servicePrice.setValue(null);
  }

  removeAdditionalService(index: number): void {
    this.additionalServices = this.additionalServices.filter((_, currentIndex) => currentIndex !== index);
  }

  save(): void {
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    if(this.selectedPositions.length === 0){
      this.toast.error('Додайте хоча б одну позицію');
      return;
    }

    this.saving = true;
    this.dialogRef.close({
      id: this.data.box?.id ?? null,
      name: this.form.controls.name.value?.trim() ?? '',
      description: this.form.controls.description.value?.trim() ?? '',
      positions: this.selectedPositions.map(item => ({
        positionId: item.position.id,
        amount: item.amount
      })),
      additionalServices: this.additionalServices.map(item => ({
        text: item.text.trim(),
        price: item.price
      }))
    });
  }
}
