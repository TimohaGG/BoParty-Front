import {Position} from "../Positions/Position";

export class TableRow{

  public unitedRow:boolean = false;
  private _title:string = "";

  public position:Position | null;
  private _amount:number;

  private _id:string;
  public cookId:number | null;

  constructor(position:Position | null,amount:number,title:string = "", unitedRow:boolean=false, id:string="", cookId:number | null = null) {
    this.position = position;
    this._amount = amount;
    if(title!=""){
      this._title = title;
    }
    this.unitedRow = unitedRow;
    this._id = id || createRowId();
    this.cookId = cookId;

  }


  get title():string{
    return this.position==null ? this._title : this.position.name;
  }

  get imgUrl(){
    return this.position==null ? "" : this.position.imgUrl;
  }

  get weight(){
    return this.position==null ? "" : this.position.weight;
  }

  get price(){
    return this.position==null ? "" : this.position.price;
  }

  get amount():number {
    return this.position==null ? 0 : this._amount;
  }

  set amount(value:number){
    this._amount = value;
  }

  get id(){
    return this.position==null ? this._id : this.position.id;
  }

  get rowId(){
    return this._id;
  }

  get posId(){
    return this.position==null ? 0 : this.position.id;
  }
}

function createRowId(): string {
  return crypto.randomUUID
    ? crypto.randomUUID()
    : 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = crypto.getRandomValues(new Uint8Array(1))[0] % 16;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    });
}
