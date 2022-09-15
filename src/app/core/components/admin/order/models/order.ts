
export class Order {
    wareHouseId(productId: number, amount: number, id: number, size: string, wareHouseId: any) {
        throw new Error('Method not implemented.');
    }
    id?: number;
    createdUserId?: number;
    createdDate?: (Date | any);
    lastUpdatedUserId?: number;
    lastUpdatedDate?: (Date | any);
    status: boolean;
    isDeleted: boolean;
    customerId?: number;
    productId?: number;
    amount?: number;
    size?: string;

}