export class WareHouseDetails {
    id?: number;
    createdUserId?: number;
    createdDate?: (Date | any);
    lastUpdatedUserId?: number;
    lastUpdatedDate?: (Date | any);
    status: boolean;
    isDeleted: boolean;
    productId?: number;
    productName?: string;
    amount?: number;
    isReadyForSell: boolean;
}