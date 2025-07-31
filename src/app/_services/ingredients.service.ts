import {inject, Injectable} from "@angular/core";
import {HttpService} from "./httpService";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";
import {catchError, map, of} from "rxjs";
import {Position} from "../models/Positions/Position";
import {Ingredient} from "../models/Positions/Ingredient";
import {Category} from "../models/Positions/Category";
import {RenameResp} from "../models/Positions/DTOs/RenameResp";
import {StorageService} from "./storage.service";

@Injectable({providedIn: 'root'})

export class IngredientsService {

  private store = inject(entityStorage);

  constructor(private http:HttpService, private userService: StorageService) {

  }

  getAll(){
    return this.http.getAllIngredients().pipe(
      map((response: Ingredient[] | ExceptionMessage) => {
        if(!isMessage(response)){
          this.store.setAllIngredients(response as Ingredient[]);
        }
        return response as Ingredient[];
      }),
      catchError(error=>{
        return of(error.error);
      })
    );

  }

  getAllCategories(){
    return this.http.getAllIngredientCategories().pipe(
      map((response: Category[] | ExceptionMessage) => {
        if(!isMessage(response)){
          this.store.setAllIngCategories(response as Category[]);
        }
        return response as Category[];
      }),
      catchError(error=>{
        return of(error.error);
      })
    )
  }

  renameCategory(id:number, newName:string){
    return this.http.renameIngCategory(id,newName).pipe(
      map((response:RenameResp | ExceptionMessage)=>{
        if(!isMessage(response)){
          return (response as RenameResp).name;
        }
        return "";
      }),
      catchError(error=>{
        throw new Error(error.error.message);
      })
    );
  }

  renameIngredient(id:number, newName:string){
    return this.http.renameIngredient(id,newName).pipe(
      map((response:RenameResp | ExceptionMessage)=>{
        if(!isMessage(response)){
          return (response as RenameResp).name;
        }
        return "";
      }),
      catchError(err =>{
        throw new Error(err.error.message);
      })
    );
  }

  addCategory(name: string) {
    return this.http.addIngCategory(name).pipe(
      map((resp:Category | ExceptionMessage)=>{
        this.store.addIngCategory(resp as Category);
        return resp as Category;
      }),
      catchError(err => {throw new Error(err.error.message)})
    )
  }

  addIngredient(name: String, categoryId: number) {
    let user = this.userService.getUser();

    console.log(categoryId);
    if(user && user.id){
      return this.http.addIngredient(name,categoryId, user.id).pipe(
        map((resp:Ingredient | ExceptionMessage)=>{
          this.store.addIngredient(resp as Ingredient);
          return resp as Ingredient;
        }),
        catchError(err=>{
          throw new Error(err.error.message);
        })
      )
    }
    else{
      console.log(user);
      throw new Error("User not found");
    }


  }

  removeCategory(id: number) {
    return this.http.removeCategory(id).pipe(
      map((resp:boolean | ExceptionMessage)=>{
        this.store.removeIngCategory(id);
        return true;
      }),
      catchError(error=>{
        throw new Error(error.error.message);
      })
    );
  }

  removeIngredient(id: number) {
    return this.http.removeIngredient(id).pipe(
      map((resp:boolean | ExceptionMessage)=>{
        this.store.removeIngredient(id);
        return true;
      }),
      catchError(error=>{
        throw new Error(error.error.message);
      })
    )
  }
}
