import {signal} from '@angular/core';
import {TestBed} from '@angular/core/testing';
import {MatDialog} from '@angular/material/dialog';
import {HotToastService} from '@ngxpert/hot-toast';
import {of} from 'rxjs';
import {entityStorage} from '../../../_helpers/storage/entityStorage';
import {OrdersService} from '../../../_services/orders.service';
import {Expences} from '../../../models/Expences/Expences';
import {MinMenu} from '../../../models/Menu/MinMenu';
import {OrderListComponent} from './order-list.component';

describe('OrderListComponent government tax statistics', () => {
  let component: OrderListComponent;
  let ordersService: jasmine.SpyObj<OrdersService>;
  let entries: ReturnType<typeof signal<Expences[]>>;
  const expense: Expences = {
    id: 1, menuId: 10, client: 'Client', date: '2026-10-30',
    shoppingSums: [{id: 1, name: 'Shopping', date: null, sum: 2000}],
    staff: [{id: 1, staffId: 1, name: 'Cook', type: 'COOK', price: 1000, payed: true}],
    otherExpences: [{id: 1, name: 'Other', amount: 500}],
  };
  const menu: MinMenu = {
    id: 10, date: '2026-10-30', client: 'Client', totalPrice: 12000,
    payed: true, temporary: false, govTax: true, govTaxAmount: 5,
  };

  beforeEach(() => {
    entries = signal([expense]);
    ordersService = jasmine.createSpyObj<OrdersService>('OrdersService', ['getCurrentUserOrderOptions', 'getExpences']);
    ordersService.getCurrentUserOrderOptions.and.returnValue(of([menu]));
    ordersService.getExpences.and.returnValue(of([expense]));
    TestBed.configureTestingModule({providers: [
      {provide: entityStorage, useValue: {expencesEntities: entries}},
      {provide: MatDialog, useValue: {}},
    ]});
    component = TestBed.runInInjectionContext(() => new OrderListComponent(ordersService, {} as HotToastService));
    component.ngOnInit();
  });

  it('deducts tax on the complete order total from income and includes it in expenses', () => {
    expect(component.getGovTaxTotal(expense)).toBe(600);
    expect(component.getSum(expense)).toBe(11400);
    expect(component.getExpenceTotal(expense)).toBe(4100);
    expect(component.getIncome(expense)).toBe(7900);
    expect(component.totalGovTax()).toBe(600);
    expect(component.totalExpences()).toBe(4100);
    expect(component.totalIncome()).toBe(7900);
  });

  it('does not charge tax when govTax is disabled or the order is missing', () => {
    ordersService.getCurrentUserOrderOptions.and.returnValue(of([{...menu, govTax: false}]));
    component.ngOnInit();
    expect(component.hasGovTax(expense)).toBeFalse();
    expect(component.getGovTaxTotal(expense)).toBe(0);
    expect(component.getSum(expense)).toBe(12000);
    expect(component.getIncome(expense)).toBe(8500);
    expect(component.getGovTaxTotal({...expense, menuId: null})).toBe(0);
    expect(component.getSum({...expense, menuId: null})).toBe(0);
    expect(component.getSum({...expense, menuId: 99})).toBe(0);
    expect(component.getGovTaxTotal({...expense, menuId: 99})).toBe(0);
  });

  it('rounds tax to two decimal places and updates period totals when entries change', () => {
    ordersService.getCurrentUserOrderOptions.and.returnValue(of([{...menu, totalPrice: 1234.56}]));
    component.ngOnInit();
    expect(component.getGovTaxTotal(expense)).toBe(61.73);
    expect(component.getSum(expense)).toBe(1172.83);
    entries.set([expense, {...expense, id: 2}]);
    expect(component.totalGovTax()).toBe(123.46);
    entries.set([]);
    expect(component.totalGovTax()).toBe(0);
    expect(component.totalExpences()).toBe(0);
  });
});
