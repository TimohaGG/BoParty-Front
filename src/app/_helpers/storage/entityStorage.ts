import {patchState, signalStore, type, withMethods, withState} from "@ngrx/signals";
import {addEntity, entityConfig, removeEntity, setAllEntities, setEntity, withEntities} from "@ngrx/signals/entities";
import {MinOrder} from "../../models/Orders/MinOrder";
import {Position} from "../../models/Positions/Position";
import {Category} from "../../models/Positions/Category";
import {Ingredient} from "../../models/Positions/Ingredient";



const initStatet = {
  loading: true,
}

const ordersMinConfig = entityConfig({
  entity:type<MinOrder>(),
  collection:"minOrders",
  selectId:(order)=>order.id
});

const positionConfig = entityConfig({
  entity:type<Position>(),
  collection:"positions",
  selectId:(position)=>position.id
});

const positionCategoryConfig = entityConfig({
  entity:type<Category>(),
  collection:"positionCategories",
  selectId:(category)=>category.id
});

const ingredientConfig = entityConfig({
  entity:type<Ingredient>(),
  collection:"ingredients",
  selectId:(ingredient)=>ingredient.id
});

const ingCategoryConfig = entityConfig({
  entity:type<Category>(),
  collection:"ingCategories",
  selectId:(category)=>category.id
});

export const entityStorage = signalStore(
  {providedIn:"root"},
  withState(initStatet),
  withEntities(ordersMinConfig),
  withEntities(positionConfig),
  withEntities(positionCategoryConfig),
  withEntities(ingredientConfig),
  withEntities(ingCategoryConfig),

  withMethods((store)=>({
    setAllMinOrders(orders:MinOrder[]){
      patchState(store,{loading:true});
      patchState(store,setAllEntities(orders, ordersMinConfig))
      patchState(store,{loading:false});
    },
    setAllPositions(positions:Position[]){
      patchState(store, setAllEntities(positions, positionConfig));
    },
    setAllPositionCategories(categories:Category[]){
      patchState(store, setAllEntities(categories,positionCategoryConfig));
    },
    setAllIngredients(ingredients:Ingredient[]){
      patchState(store, setAllEntities(ingredients,ingredientConfig));
    },
    setAllIngCategories(categories:Category[]){
      patchState(store,setAllEntities(categories,ingCategoryConfig));
    },
    addIngCategory(category:Category){
      patchState(store, addEntity(category,ingCategoryConfig));
    },
    addIngredient(ing:Ingredient){
      patchState(store, addEntity(ing,ingredientConfig));
    },
    removeIngCategory(categoryId:number){
      patchState(store,removeEntity(categoryId,ingCategoryConfig));
    },
    removeIngredient(ingId:number){
      patchState(store,removeEntity(ingId,ingredientConfig));
    }
  }))
);
