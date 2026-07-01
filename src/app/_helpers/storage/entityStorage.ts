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
import {ShoppingList} from "../../models/Menu/ShoppingList";
import {ShoppingListItem} from "../../models/Menu/ShoppingListItem";
import {Expences} from "../../models/Expences/Expences";
import {SelectedOrderPosition} from "../../models/Orders/SelectedOrderPosition";



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


const expencesConfig = entityConfig({
  entity:type<Expences>(),
  collection:"expences",
  selectId:(data)=>data.id
})

const shoppingListConfig = entityConfig({
  entity:type<ShoppingList>(),
  collection:"shoppingList",
  selectId:(data)=>data.id
})

const orderPositionsConfig = entityConfig({
  entity:type<Position>(),
  collection:"orderPositions",
  selectId:(position)=>position.id
});

const selectedOrderPositionsConfig = entityConfig({
  entity:type<SelectedOrderPosition>(),
  collection:"selectedOrderPositions",
  selectId:(item)=>item.id
});

const ORDER_SELECTION_SESSION_KEY = "selected-order-positions";

function serializeSelectedOrderPositions(items: SelectedOrderPosition[]): string {
  return JSON.stringify(items.map(item => ({
    id: item.id,
    amount: item.amount,
    position: {
      id: item.position.id,
      name: item.position.name,
      description: item.position.description,
      weight: item.position.weight,
      price: item.position.price,
      minimumAmount: item.position.minimumAmount,
      category: item.position.category,
      imgUrl: item.position.imgUrl,
      accessible: item.position.accessible,
      ingredients: []
    }
  })));
}

function persistSelectedOrderPositions(items: SelectedOrderPosition[]): void {
  if(typeof window === "undefined"){
    return;
  }

  try {
    if(items.length === 0){
      window.sessionStorage.removeItem(ORDER_SELECTION_SESSION_KEY);
      return;
    }

    window.sessionStorage.setItem(ORDER_SELECTION_SESSION_KEY, serializeSelectedOrderPositions(items));
  }
  catch {
    window.sessionStorage.removeItem(ORDER_SELECTION_SESSION_KEY);
  }
}

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
  withEntities(expencesConfig),
  withEntities(orderPositionsConfig),
  withEntities(selectedOrderPositionsConfig),


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
    setAllOrderPositions(positions:Position[]){
      patchState(store, setAllEntities(positions, orderPositionsConfig));
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

    clearOrderDetails(){
      patchState(store,removeAllEntities(orderInfoConfig));
    },
    setAllCommonData(data:CommonMenuInfo[]){
      patchState(store,setAllEntities(data,commonOrderInfoConfig));
    },
    setAllExpences(data:Expences[]){
      patchState(store,setAllEntities(data,expencesConfig));
    },
    clearExpences(){
      patchState(store,removeAllEntities(expencesConfig));
    },
    setOrder(order:Menu){
      patchState(store,removeAllEntities(orderInfoConfig));
      if(order.additionalInfo){
        patchState(store,setAllEntities(order.additionalInfo,orderInfoConfig));
      }
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
    addOrderPositions(pos:Position[]){
      patchState(store,addEntities(pos,orderPositionsConfig));
    },
    addOrder(order:Menu){
      patchState(store,setEntity(order,menuConfig));
    },
    addMinMenu(order:MinMenu){
      patchState(store,setEntity(order,menusMinConfig));
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
    },
    removeMinOrder(id:number){
      patchState(store, removeEntity(id,menusMinConfig));
    },
    hydrateSelectedOrderPositions(){
      if(typeof window === "undefined"){
        return;
      }

      const raw = window.sessionStorage.getItem(ORDER_SELECTION_SESSION_KEY);
      if(!raw){
        return;
      }

      try{
        const items = JSON.parse(raw) as SelectedOrderPosition[];
        patchState(store, setAllEntities(items, selectedOrderPositionsConfig));
      }
      catch {
        window.sessionStorage.removeItem(ORDER_SELECTION_SESSION_KEY);
      }
    },
    replaceSelectedOrderPositions(items:SelectedOrderPosition[]){
      patchState(store, setAllEntities(items, selectedOrderPositionsConfig));
      persistSelectedOrderPositions(items);
    },
    setSelectedOrderPosition(item:SelectedOrderPosition){
      patchState(store, setEntity(item, selectedOrderPositionsConfig));
      persistSelectedOrderPositions(store.selectedOrderPositionsEntities());
    },
    removeSelectedOrderPosition(id:number){
      patchState(store, removeEntity(id, selectedOrderPositionsConfig));
      persistSelectedOrderPositions(store.selectedOrderPositionsEntities());
    },
    clearSelectedOrderPositions(){
      patchState(store, removeAllEntities(selectedOrderPositionsConfig));

      if(typeof window !== "undefined"){
        window.sessionStorage.removeItem(ORDER_SELECTION_SESSION_KEY);
      }
    }
  }))
);
