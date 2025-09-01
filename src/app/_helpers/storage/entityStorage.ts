import {patchState, signalStore, type, withMethods, withState} from "@ngrx/signals";
import {
  addEntity,
  entityConfig,
  removeAllEntities, removeEntities,
  removeEntity,
  setAllEntities,
  setEntity,
  withEntities
} from "@ngrx/signals/entities";
import {MinOrder} from "../../models/Orders/MinOrder";
import {Position} from "../../models/Positions/Position";
import {Category} from "../../models/Positions/Category";
import {Ingredient} from "../../models/Positions/Ingredient";
import {Order} from "../../models/Orders/Order";
import {AdditionalOrderData} from "../../models/Orders/AdditionalOrderData";
import {CommonOrderInfo} from "../../models/Orders/CommonOrderInfo";



const initStatet = {
  loading: true,
}

const ordersMinConfig = entityConfig({
  entity:type<MinOrder>(),
  collection:"minOrders",
  selectId:(order)=>order.id
});

const orderConfig = entityConfig({
  entity:type<Order>(),
  collection:"orders",
  selectId:(order=>order.id)
})


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

const orderInfoConfig = entityConfig({
  entity:type<AdditionalOrderData>(),
  collection:"orderData",
  selectId:(data)=>data.id
  }
)

const commonOrderInfoConfig = entityConfig({
  entity:type<CommonOrderInfo>(),
  collection:"commonData",
  selectId:(data)=>data.id
})

export const entityStorage = signalStore(
  {providedIn:"root"},
  withState(initStatet),
  withEntities(ordersMinConfig),
  withEntities(orderConfig),
  withEntities(positionConfig),
  withEntities(positionCategoryConfig),
  withEntities(ingredientConfig),
  withEntities(ingCategoryConfig),
  withEntities(orderInfoConfig),
  withEntities(commonOrderInfoConfig),

  withMethods((store)=>({
    setAllMinOrders(orders:MinOrder[]){
      patchState(store,{loading:true});
      patchState(store,setAllEntities(orders, ordersMinConfig))
      patchState(store,{loading:false});
    },
    setAllOrders(order:Order[]){
      patchState(store, setAllEntities(order,orderConfig));
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
    setAllOrderDetails(data:AdditionalOrderData[]){
      patchState(store,setAllEntities(data,orderInfoConfig));
    },
    setAllCommonData(data:CommonOrderInfo[]){
      patchState(store,setAllEntities(data,commonOrderInfoConfig));
    },
    setOrder(order:Order){
      patchState(store,setEntity(order,orderConfig));
    },
    setOrderData(data:AdditionalOrderData){
      patchState(store,setEntity(data,orderInfoConfig));
    },
    setCommonData(data:CommonOrderInfo){
      patchState(store, setEntity(data,commonOrderInfoConfig))
    },
    addIngCategory(category:Category){
      patchState(store, addEntity(category,ingCategoryConfig));
    },
    addIngredient(ing:Ingredient){
      patchState(store, addEntity(ing,ingredientConfig));
    },
    addPosition(pos:Position){
      patchState(store, setEntity(pos,positionConfig));
    },
    addOrder(order:Order){
      patchState(store,setEntity(order,orderConfig));
    },
    removeIngCategory(categoryId:number){
      patchState(store,removeEntity(categoryId,ingCategoryConfig));
    },
    removeIngredient(ingId:number){
      patchState(store,removeEntity(ingId,ingredientConfig));
    },
    removePosition(id:number){
      patchState(store,removeEntity(id,positionConfig));
    },
    removeOrderData(id:number){
      patchState(store,removeEntity(id,orderInfoConfig));
    },
    removeOrder(id:number){
      patchState(store, removeEntity(id,orderConfig));
    }
  }))
);
