export class Category {
  id:number;
  name:string;
  userId:number;
  sortingOrder?:number | null;
  constructor(id:number, name:string, userId:number, sortingOrder:number | null = null) {
    this.name = name;
    this.id=id;
    this.userId=userId;
    this.sortingOrder = sortingOrder;
  }

}
