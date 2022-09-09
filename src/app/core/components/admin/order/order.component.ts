import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Order } from './models/Order';
import { OrderService } from './services/Order.service';
import { environment } from 'environments/environment';
import { data } from 'jquery';
import { Product } from '../product/models/Product';
import { LookUp } from 'app/core/models/lookUp';
import { ProductService } from '../product/services/Product.service';
import { Customer } from '../customer/models/Customer';
import { CustomerService } from '../customer/services/Customer.service';

declare var jQuery: any;

@Component({
	selector: 'app-order',
	templateUrl: './order.component.html',
	styleUrls: ['./order.component.scss']
})
export class OrderComponent implements AfterViewInit, OnInit {

	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'customerId', 'productId', 'amount', 'status', 'isDeleted', 'update', 'delete'];

	orderList: Order[];
	order: Order = new Order();
	orderAddForm: FormGroup;
	orderId: number;
	productlookUp: Product[] = [];
	customerlookUp: Customer[] = [];
	constructor(private orderService: OrderService, private customerService: CustomerService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService, private productService: ProductService) { }

	ngAfterViewInit(): void {
		this.getOrderList();
	}

	ngOnInit() {
		this.createOrderAddForm();
		this.authService.getCurrentUserId();
		this.getProductList();
		this.getCustomerList();
	}



	getProductList() {
		this.productService.getProductList().subscribe(data => {
			this.productlookUp = data;
		})
	}

	getCustomerList() {
		this.customerService.getCustomerList().subscribe(data => {
			this.customerlookUp = data;
		})
	}


	getOrderList() {
		this.orderService.getOrderList().subscribe(data => {
			this.orderList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}

	save() {

		if (this.orderAddForm.valid) {
			this.order = Object.assign({}, this.orderAddForm.value)

			if (this.order.id == 0) {
				this.order.createdUserId = this.authService.getCurrentUserId();
				this.order.lastUpdatedUserId = this.authService.getCurrentUserId();
				this.addOrder();
			}
			else {
				this.updateOrder();
			}

		}

	}

	addOrder() {
		this.orderService.addOrder(this.order).subscribe(data => {
			this.getOrderList();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);

		}, responseError => {
			this.alertifyService.error(responseError.error)
		})

	}

	updateOrder() {

		this.orderService.updateOrder(this.order).subscribe(data => {

			var index = this.orderList.findIndex(x => x.id == this.order.id);
			this.orderList[index] = this.order;
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);

		}, responseError => {
			this.alertifyService.error(responseError)
		})

	}

	createOrderAddForm() {
		this.orderAddForm = this.formBuilder.group({
			id: [0],
			createdUserId: [this.authService.getCurrentUserId()],
			createdDate: [Date.now],
			lastUpdatedUserId: [this.authService.getCurrentUserId()],
			lastUpdatedDate: [Date.now],
			status: [false, Validators.required],
			isDeleted: [false, Validators.required],
			customerId: [0, Validators.required],
			productId: [0, Validators.required],
			amount: [0, Validators.required]
		})
	}

	deleteOrder(orderId: number) {
		this.orderService.deleteOrder(orderId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.orderList = this.orderList.filter(x => x.id != orderId);
			this.dataSource = new MatTableDataSource(this.orderList);
			this.configDataTable();
		})
	}

	getOrderById(orderId: number) {
		this.clearFormGroup(this.orderAddForm);
		this.orderService.getOrderById(orderId).subscribe(data => {
			this.order = data;
			this.orderAddForm.patchValue(data);
		})
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
		});
	}

	checkClaim(claim: string): boolean {
		return this.authService.claimGuard(claim)
	}

	configDataTable(): void {
		this.dataSource.paginator = this.paginator;
		this.dataSource.sort = this.sort;
	}

	applyFilter(event: Event) {
		const filterValue = (event.target as HTMLInputElement).value;
		this.dataSource.filter = filterValue.trim().toLowerCase();

		if (this.dataSource.paginator) {
			this.dataSource.paginator.firstPage();
		}
	}

}
