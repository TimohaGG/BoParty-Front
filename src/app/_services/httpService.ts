import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {MinMenu} from "../models/Menu/MinMenu";
import {catchError, Observable, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {ExceptionMessage} from "../models/Exceptions/ExceptionMessage";
import {Position} from "../models/Positions/Position";
import {Category} from "../models/Positions/Category";
import {Ingredient} from "../models/Positions/Ingredient";
import {RenameResp} from "../models/Positions/DTOs/RenameResp";
import {IngredientAmount} from "../models/Positions/IngredientAmount";
import {Menu} from "../models/Menu/Menu";
import {MinPosAmount} from "../models/Positions/MinPosAmount";
import {CommonMenuInfo} from "../models/Menu/CommonMenuInfo";
import {AdditionalMenuData} from "../models/Menu/AdditionalMenuData";
import {CategoryCreateResp} from "../models/Positions/DTOs/CategoryCreateResp";
import {ShoppingList} from "../models/Menu/ShoppingList";
import {ShoppingListItem} from "../models/Menu/ShoppingListItem";
import {Expences, ExpencesRequest} from "../models/Expences/Expences";
import {Waiter, WaiterRequest} from "../models/Waiters/Waiter";
import {Box, BoxRequest} from "../models/Boxes/Box";

@Injectable({providedIn:"root"})
export class HttpService{


  // private baseUrl:string = "https://72.60.88.151:8085/"
  // private baseUrl:string = "http://localhost:8085/api/"
 private baseUrl:string = "api/";



  constructor(private clinet:HttpClient) {
  }

  getAllOrders():Observable<MinMenu[] | ExceptionMessage>{
    return this.clinet.get<MinMenu[] | ExceptionMessage>(this.baseUrl + "menus/get/min/all");
  }

  getCurrentUserMinOrders():Observable<MinMenu[] | ExceptionMessage>{
    return this.clinet.get<MinMenu[] | ExceptionMessage>(this.baseUrl + "menus/get/min/current");
  }

  getMinOrders(pageSize:number, currentPage:number, archive:boolean):Observable<MinMenu[] | ExceptionMessage>{
    return this.clinet.get<MinMenu[] | ExceptionMessage>(this.baseUrl + "menus/get/min", {params:{pageSize:pageSize, currentPage:currentPage, archive:archive}});
  }

  searchOrders(name: string, date: string): Observable<MinMenu[] | ExceptionMessage> {
    return this.clinet.get<MinMenu[] | ExceptionMessage>(this.baseUrl + "menus/search", {
      params: {
        name,
        date
      }
    });
  }

  getExpences(startDate: string, endDate: string): Observable<Expences[] | ExceptionMessage> {
    return this.clinet.get<Expences[] | ExceptionMessage>(this.baseUrl + "expences/get", {
      params: {
        startDate,
        endDate
      }
    });
  }

  createExpences(data: ExpencesRequest): Observable<Expences | ExceptionMessage> {
    return this.clinet.post<Expences | ExceptionMessage>(this.baseUrl + "expences/create", data);
  }

  editExpences(data: ExpencesRequest): Observable<Expences | ExceptionMessage> {
    return this.clinet.post<Expences | ExceptionMessage>(this.baseUrl + "expences/edit", data);
  }

  deleteExpences(id: number): Observable<number | ExceptionMessage> {
    return this.clinet.delete<number | ExceptionMessage>(this.baseUrl + "expences/delete/" + id);
  }

  getWaiters(): Observable<Waiter[] | ExceptionMessage> {
    return this.clinet.get<Waiter[] | ExceptionMessage>(this.baseUrl + "waiters/get");
  }

  createWaiter(data: WaiterRequest): Observable<Waiter | ExceptionMessage> {
    return this.clinet.post<Waiter | ExceptionMessage>(this.baseUrl + "waiters/create", data);
  }

  editWaiter(data: WaiterRequest): Observable<Waiter | ExceptionMessage> {
    return this.clinet.post<Waiter | ExceptionMessage>(this.baseUrl + "waiters/edit", data);
  }

  deleteWaiter(id: number): Observable<number | ExceptionMessage> {
    return this.clinet.delete<number | ExceptionMessage>(this.baseUrl + "waiters/delete/" + id);
  }

  getBoxes(): Observable<Box[] | ExceptionMessage> {
    return this.clinet.get<Box[] | ExceptionMessage>(this.baseUrl + "boxes/get");
  }

  createBox(data: BoxRequest): Observable<Box | ExceptionMessage> {
    return this.clinet.post<Box | ExceptionMessage>(this.baseUrl + "boxes/create", data);
  }

  editBox(data: BoxRequest): Observable<Box | ExceptionMessage> {
    return this.clinet.post<Box | ExceptionMessage>(this.baseUrl + "boxes/edit", data);
  }

  deleteBox(id: number): Observable<number | ExceptionMessage> {
    return this.clinet.delete<number | ExceptionMessage>(this.baseUrl + "boxes/delete/" + id);
  }

  getAllPositions() {
    return this.clinet.get<Position[] | ExceptionMessage>(this.baseUrl + "positions/get");
  }

  getPositionById(id: number) {
    return this.clinet.get<Position | ExceptionMessage>(this.baseUrl + "positions/get/" + id);
  }

  getAllPositionsByCategoryId(categoryId: number) {
    return this.clinet.get<Position[] | ExceptionMessage>(this.baseUrl + "positions/get/category/" + categoryId);
  }

  getOrderPositionsByCategoryId(categoryId: number) {
    return this.clinet.get<Position[] | ExceptionMessage>(this.baseUrl + "orders/positions/" + categoryId);
  }

  getAllCategories(userId:number) {
    return this.clinet.get<Category[] | ExceptionMessage>(this.baseUrl + `positions/categories/get/${userId}`);
  }

  getAllIngredients() {
    return this.clinet.get<Ingredient[] | ExceptionMessage>(this.baseUrl + "ingredients/get");
  }

  getAllIngredientCategories(){
    return this.clinet.get<Category[] | ExceptionMessage>(this.baseUrl + "ingredients/categories/get");
  }

  renameIngCategory(id: number, newName: string) {
    return this.clinet.post<RenameResp | ExceptionMessage>(this.baseUrl + "ingredients/categories/rename",{id:id,name:newName});
  }

  renameIngredient(id: number, newName: string) {
    return this.clinet.post<RenameResp | ExceptionMessage>(this.baseUrl + "ingredients/rename",{id:id,name:newName});
  }

  addPositionCategory(userId:number, name:string) {

    return this.clinet.post<CategoryCreateResp | ExceptionMessage>(this.baseUrl + "positions/categories/add", {name:name, userId: userId});
  }

  addIngCategory(name: string) {
    return this.clinet.post<Category | ExceptionMessage>(this.baseUrl + "ingredients/categories/add", {name:name});
  }

  addIngredient(name: String, categoryId: number, userId:number) {
    return this.clinet.post<Ingredient | ExceptionMessage>(this.baseUrl + "ingredients/add", {name:name,categoryId:categoryId, userId:userId});
  }

  removeCategory(id: number) {
    return this.clinet.delete<boolean | ExceptionMessage>(this.baseUrl + "ingredients/categories/remove?categoryId="+id);
  }

  removeIngredient(id: number) {
    return this.clinet.delete<boolean | ExceptionMessage>(this.baseUrl + "ingredients/remove?id="+id);
  }

  addPosition(formData:FormData) {
    return this.clinet.post<Position | ExceptionMessage>(this.baseUrl + "positions/add",formData);
  }

  removePosition(id: number) {
    return this.clinet.delete<number | ExceptionMessage>(this.baseUrl + "positions/remove?id="+id);
  }

  addOrder(data: any, positions:MinPosAmount[], additionalData:AdditionalMenuData[]) {
    console.log(additionalData);

    return this.clinet.post<Menu | ExceptionMessage>(this.baseUrl + "menus/create",{
      ...data,
      positions: positions,
      additionalInfo:additionalData
    });

  }

  getOrderById(id:number) {
    return this.clinet.get<Menu | ExceptionMessage>(this.baseUrl + `menus/get/${id}`);
  }

  editOrder(id: number, value: any, items: MinPosAmount[],additionalInfo:AdditionalMenuData[]) {
    return this.clinet.post<Menu | ExceptionMessage>(this.baseUrl + "menus/edit",{
      id:id,
      ...value,
      positions:items,
      additionalInfo:additionalInfo
    });
  }

  addCommonOrderInfo(res: any) {
    return this.clinet.post<CommonMenuInfo | ExceptionMessage>(this.baseUrl + "menus/info/common/add",res);
  }

  addAllCommonInfo() {
    return this.clinet.get<CommonMenuInfo[] | ExceptionMessage>(this.baseUrl + "menus/info/common");
  }

  deleteOrder(id: number) {
    return this.clinet.delete<number | ExceptionMessage>(this.baseUrl + "menus/delete/"+id);
  }

  toggleStatus(id:number,status:boolean):Observable<boolean> {
    return this.clinet.post<boolean>(this.baseUrl + "menus/edit/status", {status:status, id:id});
  }

  getOrdersAmount(archive:boolean) {
    return this.clinet.get<number>(this.baseUrl + "menus/amount",{params:{archive:archive}});
  }

  // getArchiveOrdersAmount() {
  //   return this.clinet.get<number>(this.baseUrl + "orders/amount/archive");
  // }

  // getMinOrdersArchive(perPage: number, currentPage: number) {
  //   return this.clinet.get<MinMenu[] | ExceptionMessage>(this.baseUrl + "orders/get/min/archive", {params:{pageSize:perPage, currentPage:currentPage}});
  // }
  download(id: number) {
    return this.clinet.get(this.baseUrl + "menus/generate/"+id,{responseType: "blob"});
  }

  deleteMenuInfo(id: number) {
    return this.clinet.post<number>(this.baseUrl + "menus/info/delete",{id:id});
  }

  getShoppingList(orderId: number) {
    return this.clinet.get<ShoppingList>(this.baseUrl + "menus/shopping/get/"+orderId);

  }

  toggleShoppingStatus(id: number, status: boolean) {
    return this.clinet.post<boolean>(this.baseUrl + "menus/shopping/toggle", {status:status, id:id});
  }

  addShoppingComment(shoppingItemId: number, comment: string) {
    return this.clinet.post(this.baseUrl + "menus/shopping/comment/add", {shoppingItemId:shoppingItemId, comment:comment}, {responseType: "text"});
  }

  removeShoppingComment(id: number) {
    return this.clinet.delete(this.baseUrl + "menus/shopping/comment/remove/" + id, {responseType: "text"});
  }

  addShoppingItem(data: any) {
    return this.clinet.post<ShoppingListItem>(this.baseUrl + "menus/shopping/item/add", data);
  }

  removeShoppingItem(id: number) {
    return this.clinet.delete(this.baseUrl + "menus/shopping/item/remove/" + id, {responseType: "text"});
  }

  joinOrders(ordersIds: any) {
    return this.clinet.post<MinMenu>(this.baseUrl + "menus/shopping/join",{ordersIds:ordersIds})

  }

  copyOrder(orderId: number) {
    return this.clinet.post<MinMenu | ExceptionMessage>(`menus/copy/${orderId}`, {});
  }


}
