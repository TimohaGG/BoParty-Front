import {Position} from "../Positions/Position";

export class TableRow{

  public unitedRow:boolean = false;
  private _title:string = "";

  public position:Position | null;
  private _amount:number;

  private _id:string;

  constructor(position:Position | null,amount:number,title:string = "", unitedRow:boolean=false, id:string="") {
    this.position = position;
    this._amount = amount;
    if(title!=""){
      this._title = title;
    }
    this.unitedRow = unitedRow;
    this._id = id;
  }


  get title():string{
    return this.position==null ? this._title : this.position.name;
  }

  get image(){
    return this.position==null ? "" : this.position.image;
  }

  get weight(){
    return this.position==null ? "" : this.position.weight;
  }

  get price(){
    return this.position==null ? "" : this.position.price;
  }

  get amount():number | string{
    return this.position==null ? "" : this._amount;
  }

  set amount(value:number){
    this._amount = value;
  }

  get id(){
    return this.position==null ? this._id : this.position.id;
  }
}
