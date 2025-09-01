export class Category {
  id:number;
  name:string;
  userId:number;
  constructor(id:number, name:string, userId:number) {
    this.name = name;
    this.id=id;
    this.userId=userId;
  }

}
