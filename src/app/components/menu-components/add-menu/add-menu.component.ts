import {Component, inject, Input, OnInit, signal, ViewChild} from '@angular/core';
import {MatFormField, MatLabel} from "@angular/material/form-field";
import {MatInput} from "@angular/material/input";
import {PositionsListComponent} from "../../positions-components/positions-list/positions-list.component";
import {MatDialog} from "@angular/material/dialog";
import {AddMenuPositionDialogComponent} from "../add-menu-position-dialog/add-menu-position-dialog.component";
import {MatButton, MatFabButton} from "@angular/material/button";
import {Position} from "../../../models/Positions/Position";
import {PositionAmount} from "../../../models/Positions/PositionAmount";
import {KeyValuePipe, NgOptimizedImage} from "@angular/common";
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow, MatHeaderRowDef, MatRow, MatRowDef,
  MatTable
} from "@angular/material/table";
import {CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray} from "@angular/cdk/drag-drop";
import {MatIcon} from "@angular/material/icon";
import {OrdersService} from "../../../_services/orders.service";
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from "@angular/forms";
import {MinPosAmount} from "../../../models/Positions/MinPosAmount";
import {CdkContextMenuTrigger, CdkMenu, CdkMenuItem, CdkMenuTrigger} from "@angular/cdk/menu";
import {TableRow} from "../../../models/Pdf/TableCell";
import {AddHeaderDialogComponent} from "../add-header-dialog/add-header-dialog.component";
import {ActivatedRoute, Route, Router} from "@angular/router";
import {ExceptionMessage, isMessage} from "../../../models/Exceptions/ExceptionMessage";
import {HotToastService} from "@ngxpert/hot-toast";
import {Menu} from "../../../models/Menu/Menu";
import {MatProgressSpinner} from "@angular/material/progress-spinner";
import {HttpErrorResponse} from "@angular/common/http";
import {AdditionalMenuData} from "../../../models/Menu/AdditionalMenuData";
import {AddMenuInfoComponent} from "../add-menu-info/add-menu-info.component";
import {MatCheckbox} from "@angular/material/checkbox";
import {MatOption, MatSelect} from "@angular/material/select";
import {entityStorage} from "../../../_helpers/storage/entityStorage";
import {SelectedOrderPosition} from "../../../models/Orders/SelectedOrderPosition";

export interface PosAmount {
  amount: number;
  position: Position;
}

@Component({
  selector: 'app-add-order',
  imports: [
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatTable,
    MatHeaderCell,
    MatCell,
    CdkDropList,
    MatColumnDef,
    MatHeaderCellDef,
    MatCellDef,
    MatHeaderRow,
    MatRow,
    MatHeaderRowDef,
    MatRowDef,
    CdkDrag,
    CdkDragPlaceholder,
    MatIcon,
    MatFabButton,
    ReactiveFormsModule,
    CdkMenu,
    CdkMenuItem,
    MatProgressSpinner,
    CdkMenuTrigger,
    MatCheckbox,
    MatSelect,
    MatOption,
  ],
  templateUrl: './add-menu.component.html',
  styleUrl: './add-menu.component.css'
})
export class AddMenuComponent implements OnInit {
  @ViewChild('table', {static: true}) table!: MatTable<PositionAmount>;
  @ViewChild('datatable', {static: true}) datatable!: MatTable<PositionAmount>;
  private dialog = inject(MatDialog);
  private store = inject(entityStorage);


  public editOrderid: number = -1;
  editable: boolean = false;
  loading: boolean = false;


  public selectedPositions: Position[] = []
  public posAmounts = signal<TableRow[]>([]);
  displayedColumns: string[] = ['name', 'image', 'weight', 'price', 'amount', 'mob-actions'];
  public additionalInfo = signal<AdditionalMenuData[]>([]);
  displayedColumnsInfo: string[] = ['name', 'description', 'price', 'actions'];
  public bulkAmountPreset = new FormControl('5', {nonNullable: true});
  public bulkAmountCustom = new FormControl(20, {nonNullable: true});

  public ordersForm: FormGroup = new FormGroup({
    client: new FormControl('', [Validators.required]),
    guestsAmount: new FormControl(0, [Validators.required]),
    format: new FormControl(''),
    dateTime: new FormControl('', [Validators.required]),
    duration: new FormControl(''),
    phoneNumber: new FormControl('0688714410', [Validators.required]),
    serving: new FormControl(false),
    taxAmount: new FormControl(''),
    govTax: new FormControl(false),
    govTaxAmount: new FormControl(''),
  })

  constructor(private ordersService: OrdersService, private route: ActivatedRoute, private router: Router, private toast: HotToastService) {
    if (this.route.snapshot.queryParamMap.has("editable")) {
      this.editable = this.route.snapshot.queryParamMap.get("editable") == "true";

    } else {
      this.ordersForm.disable();
      this.editOrderid = Number(this.route.snapshot.queryParamMap.get("orderId")) ?? -1;
    }
  }

  ngOnInit(): void {
    this.store.hydrateSelectedOrderPositions();
    if(this.editOrderid <= 0 && this.store.selectedOrderPositionsEntities().length > 0){
      this.applySelectedOrderPositions(this.store.selectedOrderPositionsEntities());
    }
    this.initOrderEditData();
    this.ordersForm.get('serving')?.valueChanges.subscribe(() => this.syncConditionalTaxControls());
    this.ordersForm.get('govTax')?.valueChanges.subscribe(() => this.syncConditionalTaxControls());
    this.syncConditionalTaxControls();
  }

  openPositionsDialog() {
    const ref = this.dialog.open(AddMenuPositionDialogComponent, {
      data: {
        positions: this.selectedPositions
      },
      width: "100%",
      maxWidth: "90vw",
      maxHeight: "90vh",
      height: "100%",
      panelClass: "full-width",
      disableClose: true,
      closeOnNavigation: false
    });

    ref.afterClosed().subscribe({
      next: (data: Position[] | undefined) => {
        if (data) {
          this.selectedPositions = data;
          this.posAmounts.set(this.posAmounts().filter(x => this.selectedPositions.some(el => el.id === x.id || x.unitedRow)));
          for (let elem of this.selectedPositions) {
            if (this.posAmounts().findIndex(x => x.id == elem.id) == -1) {
              this.posAmounts().push(new TableRow(elem, 0));
            }
          }
        }
      }
    })
  }

  openInfoDialog() {
    let dialog = this.dialog.open(AddMenuInfoComponent);
    dialog.afterClosed().subscribe(res => {

      if (res == null || res == "") {
        return;
      }
      if (res.isCommon) {
        this.ordersService.saveCommonInfo(res).subscribe({
          next: (data) => {
            this.additionalInfo.update((old) => [...old, {...data, id: 0, price: Number(data.price)}])
          },
          error: (err) => {
            this.toast.error(err)
          }
        })
      } else {
        this.additionalInfo.update((old) => [...old, {...res, id: 0, price: Number(res.price)}])
      }
    });
  }

  openEditInfoDialog(info: AdditionalMenuData) {
    const dialog = this.dialog.open(AddMenuInfoComponent, {
      data: {
        info,
      },
    });

    dialog.afterClosed().subscribe(res => {
      if (res == null || res == "") {
        return;
      }

      this.additionalInfo.update(items => items.map(item =>
        item === info
          ? {
            ...item,
            title: res.title,
            description: res.description,
            price: Number(res.price),
          }
          : item
      ));
    });
  }

  initOrderEditData() {
    if (this.editOrderid <= 0) {
      console.log("No order id");
      return;
    }
    this.loading = true;
    this.ordersService.getById(this.editOrderid).subscribe(
      (res: Menu | ExceptionMessage) => {
        if (isMessage(res)) {
          this.toast.show("Can't load order!", {autoClose: true, position: "bottom-center", duration: 2000})
            .afterClosed.subscribe(() => {
            this.router.navigate(['/service/orders']);
          });
        } else {
          this.ordersForm.patchValue({
            client: (res as Menu).client,
            guestsAmount: (res as Menu).guestsAmount,
            format: (res as Menu).format,
            dateTime: this.toDateTimeLocalValue((res as Menu).date),
            duration: (res as Menu).duration,
            phoneNumber: (res as Menu).phone,
            serving: (res as Menu).serving,
            taxAmount: (res as Menu).taxAmount,
            govTax: (res as Menu).govTax,
            govTaxAmount: (res as Menu).govTaxAmount,
          }, {emitEvent: false});
          this.syncConditionalTaxControls();
          let recieved = (res as Menu).positions;
          let list: TableRow[] = [];
          recieved.forEach(el => {
            if (el.title !== "" && el.title !== null) {
              list.push(new TableRow(null, 0, el.title, true, generateUUID()));
            }
            list.push(new TableRow(el.position, el.amount));
            this.selectedPositions.push(el.position);
          });
          this.posAmounts.set(list);
          this.store.replaceSelectedOrderPositions(
            recieved.map(item => ({
              id: item.position.id,
              amount: item.amount,
              position: item.position
            }))
          );
          this.additionalInfo.set(this.normalizeAdditionalInfo((res as Menu).additionalInfo));
        }
        this.loading = false;
        console.log(this.posAmounts());
      }
    );
  }

  drop(event: CdkDragDrop<string>) {
    const previousIndex = this.posAmounts().findIndex(d => d === event.item.data);
    moveItemInArray(this.posAmounts(), previousIndex, event.currentIndex);
    this.table.renderRows();
  }

  dropInfo(event: CdkDragDrop<string>) {
    const previousIndex = this.additionalInfo().findIndex(d => d === event.item.data);
    moveItemInArray(this.additionalInfo(), previousIndex, event.currentIndex);
    this.datatable.renderRows();
  }

  toggleEdit() {
    this.editable = !this.editable;
    this.editable ? this.ordersForm.enable({emitEvent: false}) : this.ordersForm.disable({emitEvent: false});
    this.syncConditionalTaxControls();

  }

  private syncConditionalTaxControls(): void {
    const taxAmount = this.ordersForm.get('taxAmount');
    const govTaxAmount = this.ordersForm.get('govTaxAmount');

    this.editable && this.ordersForm.get('serving')?.value
      ? taxAmount?.enable({emitEvent: false})
      : taxAmount?.disable({emitEvent: false});

    this.editable && this.ordersForm.get('govTax')?.value
      ? govTaxAmount?.enable({emitEvent: false})
      : govTaxAmount?.disable({emitEvent: false});
  }

  save() {
    if (this.ordersForm.invalid) {
      this.ordersForm.markAllAsTouched();
      return;
    }

    let items = this.parsePositions()
    this.loading = true;

    const additionalInfo = this.normalizeAdditionalInfo(this.additionalInfo());
    this.additionalInfo.set(additionalInfo);

    if (this.editOrderid <= 0) {
      this.saveOrder(items, additionalInfo);
    } else {
      this.editOrder(items, additionalInfo);
    }
  }

  private saveOrder(items: MinPosAmount[], additionalInfo: AdditionalMenuData[]) {
    this.ordersService.saveOrder(this.buildOrderPayload(), items, additionalInfo).subscribe(
      {
        next: (data) => {
          if (!isMessage(data)) {
            this.additionalInfo.set(this.normalizeAdditionalInfo((data as Menu).additionalInfo));
          }
          this.toast.show("Збережено!", {autoClose: true, position: "bottom-center", duration: 2000})
          this.loading = false;
        },
        error: (error: HttpErrorResponse) => {
          this.toast.error(`${error}`, {autoClose: true, position: "bottom-center", duration: 2000});
          this.loading = false;
        }
      }
    );
  }

  private editOrder(items: MinPosAmount[], additionalInfo: AdditionalMenuData[]) {

    this.ordersService.editOrder(this.editOrderid, this.buildOrderPayload(), items, additionalInfo).subscribe({
        next: (data) => {
          this.additionalInfo.set(this.normalizeAdditionalInfo((data as Menu).additionalInfo));
          this.toast.show("Збережено!", {autoClose: true, position: "bottom-center", duration: 2000});
          this.loading = false;
        },
        error: (data) => {
          this.toast.show(`Помилка редагування!\n${data}`, {autoClose: true, position: "bottom-center", duration: 2000});
          this.loading = false;
        }
      }
    );
  }

  private buildOrderPayload() {
    const rawValue = this.ordersForm.getRawValue();

    return {
      ...rawValue,
      date: this.toIsoDateTime(rawValue.dateTime)
    };
  }

  private toDateTimeLocalValue(dateTime: string) {
    if (!dateTime) {
      return '';
    }

    return dateTime.slice(0, 16);
  }

  private toIsoDateTime(dateTime: string) {
    if (!dateTime) {
      return '';
    }

    return dateTime.length === 16 ? `${dateTime}:00` : dateTime;
  }

  parsePositions() {
    let items: MinPosAmount[] = [];
    if (this.posAmounts()) {
      const amounts = this.posAmounts();
      amounts.forEach((row, i) => {
        if (row.unitedRow) {
          return; // skip unitedRow entries
        }
        const prev = amounts[i - 1];
        // if (i > 0 && prev?.unitedRow) {
        //   items.push(new MinPosAmount(
        //     row.id as number,
        //     row.amount as number,
        //     prev.title as string
        //   ));
        // } else {
        //   items.push(new MinPosAmount(
        //     row.id as number,
        //     row.amount as number
        //   ));
        // }

        let tmp = new MinPosAmount(row.id as number, row.amount as number);
        tmp.inMenuOrder = i;
        if (i > 0 && prev?.unitedRow) {
          tmp.title = prev.title as string;
        }
        items.push(tmp);
      });
    }
    return items;
  }

  private normalizeAdditionalInfo(items: AdditionalMenuData[] = []): AdditionalMenuData[] {
    const map = new Map<string, AdditionalMenuData>();

    for (const item of items) {
      const key = `${item.id}|${item.description}|${item.price}`;
      const existing = map.get(key);

      if (!existing || existing.id === 0) {
        map.set(key, {...item});
      }
    }

    return [...map.values()];
  }


  changeAmount(id: number, event: any) {
    let index = this.posAmounts().findIndex(x => x.position !== null && x.position.id == id);
    if (index != -1) {
      const amount = Number(event.target.value);
      this.posAmounts().at(index)!.amount = amount;
      const position = this.selectedPositions.find(item => item.id === id);

      if(position){
        if(!Number.isFinite(amount) || amount <= 0){
          this.store.removeSelectedOrderPosition(id);
        }
        else{
          this.store.setSelectedOrderPosition({
            id,
            amount,
            position
          });
        }
      }
    }
  }

  setBulkAmount() {
    const selectedValue = this.bulkAmountPreset.value;
    const resolvedAmount = selectedValue === 'custom'
      ? Number(this.bulkAmountCustom.value)
      : Number(selectedValue);

    if (!Number.isFinite(resolvedAmount) || resolvedAmount <= 0) {
      this.toast.show("Вкажіть коректну кількість", {autoClose: true, position: "bottom-center", duration: 2000});
      return;
    }

    this.posAmounts.update(items => {
      items.forEach(item => {
        if (!item.unitedRow) {
          item.amount = resolvedAmount;
          if(item.position){
            this.store.setSelectedOrderPosition({
              id: item.position.id,
              amount: resolvedAmount,
              position: item.position
            });
          }
        }
      });

      return [...items];
    });
  }


  sortPredicate = (index: number, item: CdkDrag<TableRow>) => {
    const arr = this.posAmounts();
    const lastIndex = arr.length - 1;

    const oldIndex = arr.indexOf(item.data);
    if (oldIndex === -1) console.log("Error");
    const copy = [...arr];
    copy.splice(oldIndex, 1);
    copy.splice(index, 0, item.data);
    if (copy.at(copy.length - 1)?.unitedRow) {
      return false;
    }

    if (!item.data.unitedRow) return true;
    if (index >= lastIndex) return false;
    return true;
  };

  removeFromList(id: number | string) {
    let index: number;

    console.log(this.posAmounts());

    this.posAmounts.update(items =>
      items.filter(x => x.id !== id)
    );

    index = this.selectedPositions.findIndex(x => x.id == id);
    if (index != -1) {
      this.selectedPositions.splice(index, 1);
    }

    if(typeof id === "number"){
      this.store.removeSelectedOrderPosition(id);
    }

  }

  prints(e: any) {
    console.log(e);
  }

  openHeaderDialog(positionId: number) {
    const dialogRef = this.dialog.open(AddHeaderDialogComponent);
    dialogRef.afterClosed().subscribe({
      next: (data) => {
        console.log(data);
        if (data) {
          let index = this.posAmounts().findIndex(x => x.id == positionId);
          if (index == -1) {
            this.posAmounts.update(arr => [...arr, new TableRow(null, 0, data, true, generateUUID())]);
          } else {
            this.posAmounts.update(arr => [
              ...arr.slice(0, index),
              new TableRow(null, 1, data, true, generateUUID()),
              ...arr.slice(index),
            ]);
          }

        }
      }
    })
  }

  removeMenuInfo(id: number) {
    console.log(id);
    this.ordersService.deleteOrderInfo(id).subscribe();
  }

  removeMenuInfoNew(info: AdditionalMenuData) {
    this.additionalInfo.update(items => items.filter(x => x !== info));

  }


  removeHeaderFromList(id: string) {

    console.log(id);
    this.posAmounts.update(items => items.filter(x => x.id != id));
    console.log(this.posAmounts());
  }


  dividePosition(id: number) {
    this.posAmounts.update(items =>
      items.flatMap(item => {
        if (item.posId !== id || item.amount <= 1) {
          return [item];
        }

        return [
          new TableRow(
            item.position,
            Math.floor(item.amount / 2),
            item.title,
            item.unitedRow
          ),
          new TableRow(
            item.position,
            Math.ceil(item.amount / 2),
            item.title,
            item.unitedRow
          )
        ];
      })
    );
  }

  private buildSelectedOrderPositionsPayload(): SelectedOrderPosition[] {
    const selectedFromStore = this.store.selectedOrderPositionsEntities();
    if(selectedFromStore.length > 0){
      return selectedFromStore;
    }

    return this.selectedPositions.map(position => {
      const row = this.posAmounts().find(item => !item.unitedRow && item.position?.id === position.id);
      return {
        id: position.id,
        amount: Number(row?.amount ?? 0),
        position
      };
    });
  }

  private applySelectedOrderPositions(items: SelectedOrderPosition[]): void {
    this.store.replaceSelectedOrderPositions(items);
    this.selectedPositions = items.map(item => item.position);

    const currentRows = this.posAmounts().filter(row => row.unitedRow);
    const nextRows = items.map(item => new TableRow(item.position, item.amount));
    this.posAmounts.set([...currentRows, ...nextRows]);
  }


  getTotalPrice(){

    let positionsPrice = this.getTotalMenuPrice();
    let additionalInfoPrice = this.additionalInfo().reduce((sum,item)=>{return sum+item.price},0);

    if(this.ordersForm.get("taxAmount")?.value!=0){
      positionsPrice = positionsPrice + positionsPrice/10;
    }

    let total = positionsPrice + additionalInfoPrice;
    if(this.ordersForm.get("govTaxAmount")?.value!=0){
      return total + total / 10;
    }
    else
      return total;
  }

  getTotalMenuPrice(){
    return this.posAmounts().reduce((sum,item)=>{return sum+(item.price == "" ? 0:item.price) * item.amount},0);
  }

  moveUp(id: any) {
    let prevIndex = this.posAmounts().findIndex(x => x.position?.id == id);
    moveItemInArray(this.posAmounts(),prevIndex,0);
    this.table.renderRows();
  }

  moveDown(id: any) {
    let prevIndex = this.posAmounts().findIndex(x => x.position?.id == id);
    let lastIndex = this.posAmounts().length - 1;
    moveItemInArray(this.posAmounts(),prevIndex,lastIndex);
    this.table.renderRows();
  }
}

function generateUUID() {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}
