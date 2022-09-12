
export class OrderDetails {
    id?: number;
    customerId?: number;
    productId?: number;
    customerName?: string;
    productName?: string;
    amount?: number;
    createdUserId?: number;
    createdDate?: (Date | any);
    lastUpdatedUserId?: number;
    lastUpdatedDate?: (Date | any);
    status: boolean;
    isDeleted: boolean;

}