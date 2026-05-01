import {patchState, signalStore, type, withMethods, withState} from "@ngrx/signals";
import {
  addEntities,
  addEntity,
  entityConfig,
  removeAllEntities, removeEntities,
  removeEntity,
  setAllEntities,
  setEntity,
  withEntities
} from "@ngrx/signals/entities";
import {MinMenu} from "../../models/Menu/MinMenu";
import {Position} from "../../models/Positions/Position";
import {Category} from "../../models/Positions/Category";
import {Ingredient} from "../../models/Positions/Ingredient";
import {Menu} from "../../models/Menu/Menu";
import {AdditionalMenuData} from "../../models/Menu/AdditionalMenuData";
import {CommonMenuInfo} from "../../models/Menu/CommonMenuInfo";
import {Order} from "../../models/Orders/Order";



type OrdersListState = {
  pageSize: number,
  ordersTotal: number,
  currentPage: number,
  loading: boolean,
}
const initState:OrdersListState = {
  pageSize: 10,
  ordersTotal: 0,
  currentPage: 0,
  loading: true,
}

const menusMinConfig = entityConfig({
  entity:type<MinMenu>(),
  collection:"minMenus",
  selectId:(order)=>order.id
});

const menuConfig = entityConfig({
  entity:type<Menu>(),
  collection:"menus",
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
  entity:type<AdditionalMenuData>(),
  collection:"orderData",
  selectId:(data)=>data.id
  }
)

const commonOrderInfoConfig = entityConfig({
  entity:type<CommonMenuInfo>(),
  collection:"commonData",
  selectId:(data)=>data.id
})


const orderConfig = entityConfig({
  entity:type<Order>(),
  collection:"orders",
  selectId:(data)=>data.id
})
export const entityStorage = signalStore(
  {providedIn:"root"},
  withState(initState),
  withEntities(menusMinConfig),
  withEntities(menuConfig),
  withEntities(positionConfig),
  withEntities(positionCategoryConfig),
  withEntities(ingredientConfig),
  withEntities(ingCategoryConfig),
  withEntities(orderInfoConfig),
  withEntities(commonOrderInfoConfig),
  withEntities(orderConfig),

  withMethods((store)=>({
    setAllMinOrders(orders:MinMenu[]){
      patchState(store,{loading:true});
      patchState(store,setAllEntities(orders, menusMinConfig))
      patchState(store,{loading:false});
    },
    clearMinOrders(){
      patchState(store,{loading:true});
      patchState(store,removeAllEntities(menusMinConfig));
    },
    setAllOrders(order:Menu[]){
      patchState(store, setAllEntities(order,menuConfig));
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
    setAllOrderDetails(data:AdditionalMenuData[]){
      patchState(store,setAllEntities(data,orderInfoConfig));
    },
    setAllCommonData(data:CommonMenuInfo[]){
      patchState(store,setAllEntities(data,commonOrderInfoConfig));
    },
    selectAllOrdersData(data:Order[]){
      patchState(store,setAllEntities(data,orderConfig));
    },

    setOrder(order:Menu){
      patchState(store,setEntity(order,menuConfig));
    },
    setOrderData(data:AdditionalMenuData){
      patchState(store,setEntity(data,orderInfoConfig));
    },
    setCommonData(data:CommonMenuInfo){
      patchState(store, setEntity(data,commonOrderInfoConfig))
    },
    setCurrentPage(page:number){
      patchState(store, {currentPage:page})
    },
    setTotalPages(size:number){
      patchState(store,{ordersTotal:size})
    },
    setPerPage(size:number){
      patchState(store,{pageSize:size})
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
    addPositions(pos:Position[]){
      patchState(store,addEntities(pos,positionConfig));
    },
    addOrder(order:Menu){
      patchState(store,setEntity(order,menuConfig));
    },
    addPositionCategory(category:Category){
      patchState(store,addEntity(category,positionCategoryConfig));
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
      patchState(store, removeEntity(id,menuConfig));
    }
  }))
);
