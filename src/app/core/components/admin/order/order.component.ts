import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { Order } from './models/Order';
import { OrderService } from './services/Order.service';
import { Product } from '../product/models/Product';
import { ProductService } from '../product/services/Product.service';
import { Customer } from '../customer/models/Customer';
import { CustomerService } from '../customer/services/Customer.service';
import { OrderDetails } from './models/orderDetails';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { WareHouseService } from '../wareHouse/services/WareHouse.service';
import { WareHouse } from '../wareHouse/models/WareHouse';
import { LookUp } from 'app/core/models/lookUp';
import { QualityControlTypeEnumLabelMapping } from '../product/models/size-enum';
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
	displayedColumns: string[] = ['id', 'customerName', 'productName', 'amount', 'size', 'status', 'update', 'delete'];

	orderList: OrderDetails[];
	order: Order = new Order();
	orderAddForm: FormGroup;
	orderId: number;
	productlookUp: Product[] = [];
	customerlookUp: Customer[] = [];
	sizelookUp: LookUp[] = [];
	sizess: string[] = Object.keys(QualityControlTypeEnumLabelMapping);

	//auto complete
	//autocomplete
	filteredProducts: Observable<Product[]>;
	filteredCustomers: Observable<Customer[]>;


	constructor(private orderService: OrderService, private wareHouseService: WareHouseService, private customerService: CustomerService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService, private productService: ProductService) { }

	ngAfterViewInit(): void {
		this.getOrderDetails();
	}

	ngOnInit() {
		this.createOrderAddForm();
		this.authService.getCurrentUserId();
		this.getProductList();
		this.getCustomerList();
		this.sizess.forEach(element => {
			this.sizelookUp.push({ id: [Number(element)], label: QualityControlTypeEnumLabelMapping[Number(element)] });
		})
	}

	getProductList() {
		this.productService.getProductList().subscribe(data => {
			this.productlookUp = data;

			this.filteredProducts = this.orderAddForm.controls.productId.valueChanges.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value.productName),
				map(name => name ? this._filter(name) : this.productlookUp.slice())
			);
		})
	}


	//product auto complete
	private _filter(value: string): Product[] {
		const filterValue = value.toLowerCase();

		return this.productlookUp.filter(option => option.productName.toLowerCase().includes(filterValue));
	}
	displayFn(product: Product): string {
		return product && product.productName ? product.productName : '';
	}


	//customer auto complete
	private _filter1(value: string): Customer[] {
		const filterValue1 = value.toLowerCase();

		return this.customerlookUp.filter(option => option.customerName.toLowerCase().includes(filterValue1));
	}

	displayFn1(customer: Customer): string {
		return customer && customer.customerName ? customer.customerName : '';
	}




	getCustomerList() {
		this.customerService.getCustomerList().subscribe(data => {
			this.customerlookUp = data;
			this.filteredCustomers = this.orderAddForm.controls.customerId.valueChanges.pipe(
				startWith(''),
				map(value1 => typeof value1 === 'string' ? value1 : value1.customerName),
				map(name1 => name1 ? this._filter1(name1) : this.customerlookUp.slice())
			);
		})
	}


	// getOrderList() {
	// 	this.orderService.getOrderList().subscribe(data => {
	// 		this.orderList = data;
	// 		this.dataSource = new MatTableDataSource(data);
	// 		this.configDataTable();
	// 	});
	// }


	//sizelookupa id g??nder ona g??re labeli getir
	getSizeLabel(id: number) {
		return this.sizelookUp.find(x => x.id == id).label;
	}

	save() {

		if (this.orderAddForm.valid) {
			this.order = Object.assign({}, this.orderAddForm.value)

			if (this.order.id == 0) {
				this.order.createdUserId = this.authService.getCurrentUserId();
				this.order.lastUpdatedUserId = this.authService.getCurrentUserId();
				this.order.createdDate = Date.now;
				this.order.lastUpdatedDate = Date.now;
				this.order.isDeleted = false;
				this.addOrder();

			}
			else {
				this.updateOrder();
			}

		}

	}

	addOrder() {
		this.orderService.addOrder(this.order).subscribe(data => {
			this.getOrderDetails();
			this.order = new Order();
			jQuery('#order').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.orderAddForm);
			this.getOrderDetails();
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
			this.getOrderDetails();
		}, responseError => {
			this.alertifyService.error(responseError)
		})

	}

	createOrderAddForm() {
		this.orderAddForm = this.formBuilder.group({
			id: [0],
			status: [false, Validators.required],
			isDeleted: [Validators.required],
			customerId: [0, Validators.required],
			productId: [0, Validators.required],
			productName: [''],
			customerName: [''],
			amount: [0, Validators.required],
			size: ['', Validators.required],
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

	getOrderDetails() {
		this.orderService.getOrderDetails().subscribe(data => {
			this.orderList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}


	clearFormGroup(group: FormGroup) {

		group.markAsUntouched();
		group.reset();

		Object.keys(group.controls).forEach(key => {
			group.get(key).setErrors(null);
			if (key == 'id')
				group.get(key).setValue(0);
			if (key == 'status')
				group.get(key).setValue(false);
			if (key == 'isDeleted')
				group.get(key).setValue(false);
			if (key == 'customerId')
				group.get(key).setValue(0);
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'amount')
				group.get(key).setValue(0);
			if (key == 'size')
				group.get(key).setValue("");
			if (key == 'createdUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
			if (key == 'lastUpdatedUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
			if (key == 'createdDate')
				group.get(key).setValue(Date.now);
			if (key == 'lastUpdatedDate')
				group.get(key).setValue(Date.now);
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
