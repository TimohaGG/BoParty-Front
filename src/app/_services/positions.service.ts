import {inject, Injectable} from "@angular/core";
import {entityStorage} from "../_helpers/storage/entityStorage";
import {HttpErrorResponse, HttpResponse} from "@angular/common/http";
import {HttpService} from "./httpService";
import {catchError, map, Observable, of, throwError} from "rxjs";
import {Position} from "../models/Positions/Position";
import {ExceptionMessage, isMessage} from "../models/Exceptions/ExceptionMessage";

@Injectable({
  providedIn: 'root'
})

export class PositionsService {
  public store = inject(entityStorage);

  constructor(private http: HttpService) {

  }

  public getByCategory(categoryId:number=0):Observable<Position[] | ExceptionMessage>{
    return this.http.getAllPositionsByCategoryId(categoryId).pipe(
      map((res:Position[] | ExceptionMessage)=>{
        if(!isMessage(res)){
          this.store.addPositions(res as Position[]);
        }
        return res as Position[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  public getAll():Observable<Position[] | ExceptionMessage> {
    return this.http.getAllPositions().pipe(
      map((response:Position[] | ExceptionMessage) => {
        if(!isMessage(response)){
          this.store.setAllPositions(response as Position[]);
        }
        return response as Position[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }

  public getById(id:number):Observable<Position | ExceptionMessage> {
    return this.http.getPositionById(id).pipe(
      map((response:Position | ExceptionMessage) => {
        if(!isMessage(response)){
          this.store.addPosition(response as Position);
        }
        return response as Position;
      }),
      catchError((error:HttpErrorResponse)=>{
        const msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }

  public addPosition(formData:FormData):Observable<Position | ExceptionMessage>{
    return this.http.addPosition(formData).pipe(
      map((response:Position | ExceptionMessage)=>{
        this.store.addPosition(response as Position);
        return response as Position;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  public updateAccessibility(id:number, accessible:boolean):Observable<Position | ExceptionMessage>{
    return this.http.updatePositionAccessibility(id, accessible).pipe(
      map((response:Position | ExceptionMessage)=>{
        if(!isMessage(response)){
          this.store.addPosition(response as Position);
        }
        return response as Position;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  public getArchived():Observable<Position[] | ExceptionMessage> {
    return this.http.getArchivedPositions().pipe(
      map((response:Position[] | ExceptionMessage) => {
        return response as Position[];
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    );
  }

  public updateCookingImage(id:number, image:File):Observable<Position | ExceptionMessage>{
    const formData = new FormData();
    formData.set("image", image, image.name);

    return this.http.updatePositionCookingImage(id, formData).pipe(
      map((response:Position | ExceptionMessage)=>{
        if(!isMessage(response)){
          this.store.addPosition(response as Position);
        }
        return response as Position;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  public archivePosition(id:number):Observable<Position | ExceptionMessage>{
    return this.http.archivePosition(id).pipe(
      map((response:Position | ExceptionMessage)=>{
        if(!isMessage(response)){
          this.store.removePosition(id);
        }
        return response as Position;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  public restorePosition(id:number):Observable<Position | ExceptionMessage>{
    return this.http.restorePosition(id).pipe(
      map((response:Position | ExceptionMessage)=>{
        if(!isMessage(response)){
          this.store.addPosition(response as Position);
        }
        return response as Position;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  removePosition(id: number) {
    return this.http.removePosition(id).pipe(
      map((response:number | ExceptionMessage) => {
        this.store.removePosition(id);
        return response as number;
      }),
      catchError((error:HttpErrorResponse)=>{
        let msg = new ExceptionMessage(error.error.message, error.error.status);
        return of(msg);
      })
    )
  }

  downloadFullMenuPdf(): Observable<void> {
    return this.http.downloadFullMenuPdf().pipe(
      map(response => {
        if (response.body) {
          this.downloadBlob(response.body, this.resolvePdfFilename(response, this.buildFullMenuFilename()));
        }
      }),
      catchError((error: HttpErrorResponse) => {
        return throwError(() => new Error(error.error?.message ?? "Не вдалося завантажити повне меню"));
      })
    );
  }

  private downloadBlob(blob: Blob, fileName: string): void {
    const fileBlob = this.isIosDevice()
      ? new Blob([blob], {type: 'application/octet-stream'})
      : blob;

    const url = window.URL.createObjectURL(fileBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.rel = 'noopener';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private isIosDevice(): boolean {
    const userAgent = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent)
      || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  }

  private buildFullMenuFilename(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    return `full-menu-${day}-${month}-${year}.pdf`;
  }

  private resolvePdfFilename(response: HttpResponse<Blob>, fallback: string): string {
    const disposition = response.headers.get('content-disposition');
    if (!disposition) {
      return fallback;
    }

    const utfMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
    if (utfMatch?.[1]) {
      return decodeURIComponent(utfMatch[1]).replace(/["']/g, '');
    }

    const plainMatch = disposition.match(/filename="?([^";]+)"?/i);
    if (plainMatch?.[1]) {
      return plainMatch[1].trim();
    }

    return fallback;
  }


}
