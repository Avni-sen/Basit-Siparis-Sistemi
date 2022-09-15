import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order } from '../models/Order';
import { environment } from 'environments/environment';
import { OrderDetails } from '../models/orderDetails';
import { WareHouse } from '../../wareHouse/models/WareHouse';
import { Size } from '@agm/core/services/google-maps-types';


@Injectable({
  providedIn: 'root'
})
export class OrderService {

  constructor(private httpClient: HttpClient) { }


  getOrderList(): Observable<Order[]> {

    return this.httpClient.get<Order[]>(environment.getApiUrl + '/orders/getall')
  }

  getOrderById(id: number): Observable<Order> {
    return this.httpClient.get<Order>(environment.getApiUrl + '/orders/getbyid?id='+id)
  }

  addOrder(order: Order): Observable<any> {

    return this.httpClient.post(environment.getApiUrl + '/orders/', order, { responseType: 'text' });
  }

  updateOrder(order: Order): Observable<any> {
    return this.httpClient.put(environment.getApiUrl + '/orders/', order, { responseType: 'text' });

  }

  deleteOrder(id: number) {
    return this.httpClient.request('delete', environment.getApiUrl + '/orders/', { body: { id: id } });
  }

  getOrderDetails(): Observable<OrderDetails[]> {
    return this.httpClient.get<OrderDetails[]>(environment.getApiUrl + '/orders/getorderdetails')
  }

}