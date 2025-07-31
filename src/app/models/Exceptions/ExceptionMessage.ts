export class ExceptionMessage {
  public message: string;
  public code:number;
  constructor(message: string, code:number) {
    this.message = message;
    this.code = code;
  }
}


export function isMessage(data:any):boolean {
  return !!(data as ExceptionMessage).message;
}

