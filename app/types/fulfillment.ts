interface Customer {
    customer_id: number;
    company_id: number;
    company_name: string;
}

interface Address {
    business_name: string;
    reference_name: string;
    address: string;
    city: string;
    street: string;
    province: string;
    country: string;
    zip_code: string;
    email: string;
    tel: string;
}

interface CourierData {
    courier_name: string;
    courier_tracking: string;
}

interface ExtraData {
    courier_data: CourierData;
    customer_reference: string;
    reference_name: string;
    provider: string;
}

export type ProductOrderEntry = {
    order_id: number;
    customer_name: string;
    quantity: number;
    warehouse: string;
    position: string;
    address: Address;
};

export type GroupedProduct = {
    product: Product;
    orders: ProductOrderEntry[];
};

// export class Orders implements GroupedProduct {
//     product: Product;
//     orders: ProductOrderEntry[];
//
//     private constructor(params: { product: Product; orders: ProductOrderEntry[] }) {
//         this.product = params.product;
//         this.orders = params.orders;
//     }
//
//     static create(data: any): Orders {
//         return new Orders({
//             product: {
//                 product_id: data.product?.product_id ?? 0,
//                 product_sku: data.product?.product_sku ?? "",
//                 product_name: data.product?.product_name ?? "",
//                 product_position: data.product?.product_position ?? "",
//                 height: data.product?.height ?? 0,
//                 width: data.product?.width ?? 0,
//                 length: data.product?.length ?? 0,
//                 weight: data.product?.weight ?? 0,
//                 note: data.product?.note ?? "",
//                 stock: data.product?.stock ?? 0,
//             },
//             orders: (data.orders ?? []).map((entry: any) => ({
//                 order_id: entry.order_id ?? 0,
//                 customer_name: entry.customer_name ?? "",
//                 quantity: entry.quantity ?? 0,
//                 position: entry.position ?? "",
//                 warehouse: entry.warehouse ?? "",
//                 address: {
//                     business_name: entry.address?.business_name ?? "",
//                     reference_name: entry.address?.reference_name ?? "",
//                     address: entry.address?.address ?? "",
//                     city: entry.address?.city ?? "",
//                     street: entry.address?.street ?? "",
//                     province: entry.address?.province ?? "",
//                     country: entry.address?.country ?? "",
//                     zip_code: entry.address?.zip_code ?? "",
//                     email: entry.address?.email ?? "",
//                     tel: entry.address?.tel ?? "",
//                 },
//                 barcode: entry.barcode ?? ""
//             })),
//         });
//     }
// }

export interface Product {
    product_id: number;
    product_sku: string;
    product_name: string;
    product_position: string;
    height: number;
    width: number;
    length: number;
    weight: number;
    note: string;
    stock: number;
}

interface MainOrder {
    id: number;
    created_at: string;
    customer: Customer;
    warehouse: string;
    address: Address;
    extra_data: ExtraData;
    note: string;
    warehouse_note: string | null;
    products: Product[];
}

export class Order implements MainOrder {
    id: number;
    created_at: string;
    customer: Customer;
    warehouse: string;
    address: Address;
    extra_data: ExtraData;
    note: string;
    warehouse_note: string | null;
    products: Product[];

    private constructor(params: MainOrder) {
        Object.assign(this, params);
    }

    static create(data: unknown): Order {
        return new Order({
            id: data.id ?? 0,
            created_at: data.created_at ?? new Date().toISOString(),
            customer: data.customer ?? {
                customer_id: 0,
                company_id: 0,
                company_name: ''
            },
            warehouse: data.warehouse ?? '',
            address: data.address ?? {
                business_name: '',
                reference_name: '',
                address: '',
                city: '',
                street: '',
                province: '',
                country: '',
                zip_code: '',
                email: '',
                tel: ''
            },
            extra_data: data.extra_data ?? {
                courier_data: {
                    courier_name: '',
                    courier_tracking: ''
                },
                customer_reference: '',
                reference_name: '',
                provider: ''
            },
            note: data.note ?? '',
            warehouse_note: data.warehouse_note ?? null,
            products: data.products ?? []
        });
    }
}
