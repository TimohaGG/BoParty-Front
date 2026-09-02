export interface CategoryCreateResp{
  id:number;
  name:string;
  companyId:number | null;
  companyName:string | null;
  sortingOrder?:number | null;
}
