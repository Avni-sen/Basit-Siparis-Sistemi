import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { AlertifyService } from 'app/core/services/alertify.service';
import { LookUpService } from 'app/core/services/lookUp.service';
import { AuthService } from 'app/core/components/admin/login/services/auth.service';
import { WareHouse } from './models/WareHouse';
import { WareHouseService } from './services/WareHouse.service';
import { environment } from 'environments/environment';
import { ProductService } from '../product/services/Product.service';
import { Product } from '../product/models/Product';

declare var jQuery: any;

@Component({
	selector: 'app-wareHouse',
	templateUrl: './wareHouse.component.html',
	styleUrls: ['./wareHouse.component.scss']
})
export class WareHouseComponent implements AfterViewInit, OnInit {

	dataSource: MatTableDataSource<any>;
	@ViewChild(MatPaginator) paginator: MatPaginator;
	@ViewChild(MatSort) sort: MatSort;
	displayedColumns: string[] = ['id', 'productId', 'amount', 'isReadyForSell', 'status', 'isDeleted', 'update', 'delete'];

	wareHouseList: WareHouse[];
	wareHouse: WareHouse = new WareHouse();
	wareHouseAddForm: FormGroup;
	products: Product[] = [];

	wareHouseId: number;

	constructor(private wareHouseService: WareHouseService, private productService: ProductService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService) { }

	ngAfterViewInit(): void {
		this.getWareHouseList();
	}

	ngOnInit() {
		this.createWareHouseAddForm();
		this.getProductList();
	}


	getWareHouseList() {
		this.wareHouseService.getWareHouseList().subscribe(data => {
			this.wareHouseList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		});
	}

	getProductList() {

		this.productService.getProductList().subscribe(data => {
			this.products = data;
		})
	}

	save() {
		if (this.wareHouseAddForm.valid) {
			this.wareHouse = Object.assign({}, this.wareHouseAddForm.value)
			if (this.wareHouse.id == 0) {
				this.wareHouse.createdUserId = this.authService.getCurrentUserId();
				this.wareHouse.lastUpdatedUserId = this.authService.getCurrentUserId();
				this.addWareHouse();
			}
			else
				this.updateWareHouse();
		}

	}

	addWareHouse() {

		this.wareHouseService.addWareHouse(this.wareHouse).subscribe(data => {
			this.getWareHouseList();
			this.wareHouse = new WareHouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.wareHouseAddForm);

		})

	}

	updateWareHouse() {

		this.wareHouseService.updateWareHouse(this.wareHouse).subscribe(data => {

			var index = this.wareHouseList.findIndex(x => x.id == this.wareHouse.id);
			this.wareHouseList[index] = this.wareHouse;
			this.dataSource = new MatTableDataSource(this.wareHouseList);
			this.configDataTable();
			this.wareHouse = new WareHouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.wareHouseAddForm);

		})

	}

	createWareHouseAddForm() {
		this.wareHouseAddForm = this.formBuilder.group({
			id: [0],
			createdUserId: [this.authService.getCurrentUserId()],
			createdDate: [Date.now],
			lastUpdatedUserId: [this.authService.getCurrentUserId()],
			lastUpdatedDate: [Date.now],
			status: [false, Validators.required],
			isDeleted: [false, Validators.required],
			productId: [0, Validators.required],
			amount: [0, Validators.required],
			isReadyForSell: [false, Validators.required]
		})
	}

	deleteWareHouse(wareHouseId: number) {
		this.wareHouseService.deleteWareHouse(wareHouseId).subscribe(data => {
			this.alertifyService.success(data.toString());
			this.wareHouseList = this.wareHouseList.filter(x => x.id != wareHouseId);
			this.dataSource = new MatTableDataSource(this.wareHouseList);
			this.configDataTable();
		})
	}

	getWareHouseById(wareHouseId: number) {
		this.clearFormGroup(this.wareHouseAddForm);
		this.wareHouseService.getWareHouseById(wareHouseId).subscribe(data => {
			this.wareHouse = data;
			this.wareHouseAddForm.patchValue(data);
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
