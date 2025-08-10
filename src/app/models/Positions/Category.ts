export class Category {
  id:number;
  name:string;
  order:number;
  constructor(id:number, name:string, order:number) {
    this.name = name;
    this.id=id;
    this.order=order;
  }

}
