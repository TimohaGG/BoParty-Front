export class MinPosAmount{
  posId:number = 0;
  amount:number = 0;
  title:string = "";
  constructor(posId:number, amount:number, title:string = ""){
    this.posId = posId;
    this.amount = amount;
    this.title = title;
  }
}
