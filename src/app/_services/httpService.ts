import {HttpClient, HttpErrorResponse, HttpHeaders} from "@angular/common/http";
import {MinOrder} from "../models/Orders/MinOrder";
import {catchError, Observable, throwError} from "rxjs";
import {Injectable} from "@angular/core";
import {ExceptionMessage} from "../models/Exceptions/ExceptionMessage";
import {Position} from "../models/Positions/Position";
import {Category} from "../models/Positions/Category";
import {Ingredient} from "../models/Positions/Ingredient";
import {RenameResp} from "../models/Positions/DTOs/RenameResp";
import {IngredientAmount} from "../models/Positions/IngredientAmount";
import {Order} from "../models/Orders/Order";
import {MinPosAmount} from "../models/Positions/MinPosAmount";

@Injectable({providedIn:"root"})
export class HttpService{

  private baseUrl:string = "http://localhost:8080/"

  constructor(private clinet:HttpClient) {
  }

  getAllOrders():Observable<Order[] | ExceptionMessage>{
    return this.clinet.get<Order[] | ExceptionMessage>(this.baseUrl + "orders/get");
  }

  getAllPositions() {
    return this.clinet.get<Position[] | ExceptionMessage>(this.baseUrl + "positions/get");
  }

  getAllCategories() {
    return this.clinet.get<Category[] | ExceptionMessage>(this.baseUrl + "positions/categories/get");
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

  addOrder(data: any, positions:MinPosAmount[]) {
    return this.clinet.post<Order | ExceptionMessage>(this.baseUrl + "orders/create",{
      ...data,
      positions: positions,
    });

  }

  getOrderById(id:number) {
    return this.clinet.get<Order | ExceptionMessage>(this.baseUrl + `orders/get/${id}`);
  }

  editOrder(id: number, value: any, items: MinPosAmount[]) {
    return this.clinet.post<Order | ExceptionMessage>(this.baseUrl + "orders/edit",{
      id:id,
      ...value,
      positions:items
    });
  }
}
