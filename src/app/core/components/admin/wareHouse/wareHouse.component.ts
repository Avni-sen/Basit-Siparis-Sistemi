import { Component, AfterViewInit, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
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
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { QualityControlTypeEnumLabelMapping, Size } from '../product/models/size-enum';
import { LookUp } from 'app/core/models/lookUp';

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
	displayedColumns: string[] = ['id', 'productId', 'amount', 'size', 'isReadyForSell', 'status', 'update', 'delete'];

	wareHouseList: WareHouse[];
	wareHouse: WareHouse = new WareHouse();
	wareHouseAddForm: FormGroup;
	products: Product[] = [];

	sizelookUp: LookUp[] = [];
	sizess: string[] = Object.keys(QualityControlTypeEnumLabelMapping);
	wareHouseId: number;

	//autocomplete
	filteredProducts: Observable<Product[]>;



	constructor(private wareHouseService: WareHouseService, private productService: ProductService, private lookupService: LookUpService, private alertifyService: AlertifyService, private formBuilder: FormBuilder, private authService: AuthService) { }

	ngAfterViewInit(): void {
		this.getWareHouseDetails();
	}

	ngOnInit() {
		this.getProductList();
		this.createWareHouseAddForm();
		this.sizess.forEach(element => {
			this.sizelookUp.push({ id: [Number(element)], label: QualityControlTypeEnumLabelMapping[Number(element)] });
		});
	}


	getWareHouseDetails() {
		this.wareHouseService.getWareHouseDetails().subscribe(data => {
			this.wareHouseList = data;
			this.dataSource = new MatTableDataSource(data);
			this.configDataTable();
		})
	}

	getProductList() {
		this.productService.getProductList().subscribe(data => {
			this.products = data;
			this.filteredProducts = this.wareHouseAddForm.controls.productId.valueChanges.pipe(
				startWith(''),
				map(value => typeof value === 'string' ? value : value.productName),
				map(name => name ? this._filter(name) : this.products.slice())
			);

		})
	}

	private _filter(value: string): Product[] {
		const filterValue = value.toLowerCase();

		return this.products.filter(option => option.productName.toLowerCase().includes(filterValue));
	}
	displayFn(user: Product): string {
		return user && user.productName ? user.productName : '';
	}


	//sizelookupa id gönder id si eşit olan labeli getir...
	getSizeLabel(id: number) {
		return QualityControlTypeEnumLabelMapping[id]
	}

	save() {
		if (this.wareHouseAddForm.valid) {
			this.wareHouse = Object.assign({}, this.wareHouseAddForm.value)
			debugger
			console.log(this.wareHouse);
			this.wareHouse.productId = this.wareHouse.productId['id'];
			console.log(this.wareHouse);

			if (this.wareHouse.id == 0) {
				this.wareHouse.createdUserId = this.authService.getCurrentUserId();
				this.wareHouse.lastUpdatedUserId = this.authService.getCurrentUserId();
				this.wareHouse.createdDate = Date.now;
				this.wareHouse.lastUpdatedDate = Date.now;
				this.wareHouse.isDeleted = false;
				this.addWareHouse();
			}
			else
				this.updateWareHouse();
		}
	}

	addWareHouse() {

		this.wareHouseService.addWareHouse(this.wareHouse).subscribe(data => {
			this.getProductList();
			this.wareHouse = new WareHouse();
			jQuery('#warehouse').modal('hide');
			this.alertifyService.success(data);
			this.clearFormGroup(this.wareHouseAddForm); this.getWareHouseDetails();
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
			this.getWareHouseDetails();
		})

	}

	createWareHouseAddForm() {
		this.wareHouseAddForm = this.formBuilder.group({
			id: [0],
			status: [false, Validators.required],
			isDeleted: [Validators.required],
			productId: [0, Validators.required],
			amount: [0, Validators.required],
			size: [0, Validators.required],
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
			if (key == 'productId')
				group.get(key).setValue(0);
			if (key == 'amount')
				group.get(key).setValue(0);
			if (key == 'isReadyForSell')
				group.get(key).setValue(false);
			if (key == 'size')
				group.get(key).setValue(0);
			if (key == 'status')
				group.get(key).setValue(true);
			if (key == 'isDeleted')
				group.get(key).setValue(false);
			if (key == 'createdUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
			if (key == 'createdDate')
				group.get(key).setValue(Date.now);
			if (key == 'lastUpdatedUserId')
				group.get(key).setValue(this.authService.getCurrentUserId());
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
