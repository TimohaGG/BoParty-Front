export class Category {
  id:number;
  name:string;
  companyId:number | null;
  companyName:string | null;
  sortingOrder?:number | null;
  constructor(id:number, name:string, sortingOrder:number | null = null, companyId:number | null = null, companyName:string | null = null) {
    this.name = name;
    this.id=id;
    this.companyId=companyId;
    this.companyName=companyName;
    this.sortingOrder = sortingOrder;
  }

}
