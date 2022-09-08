import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { WareHouse } from '../models/WareHouse';
import { environment } from 'environments/environment';


@Injectable({
  providedIn: 'root'
})
export class WareHouseService {

  constructor(private httpClient: HttpClient) { }


  getWareHouseList(): Observable<WareHouse[]> {

    return this.httpClient.get<WareHouse[]>(environment.getApiUrl + '/wareHouses/getall')
  }

  getWareHouseById(id: number): Observable<WareHouse> {
    return this.httpClient.get<WareHouse>(environment.getApiUrl + '/wareHouses/getbyid?id='+id)
  }

  addWareHouse(wareHouse: WareHouse): Observable<any> {

    return this.httpClient.post(environment.getApiUrl + '/wareHouses/', wareHouse, { responseType: 'text' });
  }

  updateWareHouse(wareHouse: WareHouse): Observable<any> {
    return this.httpClient.put(environment.getApiUrl + '/wareHouses/', wareHouse, { responseType: 'text' });

  }

  deleteWareHouse(id: number) {
    return this.httpClient.request('delete', environment.getApiUrl + '/wareHouses/', { body: { id: id } });
  }


}