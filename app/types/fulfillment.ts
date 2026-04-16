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
    picking_group: number | null | undefined;
};

export type GroupedProduct = {
    product: Product;
    orders: ProductOrderEntry[];
};


export interface ProductPosition {
    product_id: number;
    wh_id: number;
    delivery_id: number;
    wh_position: string;
    stock: number;
}

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
    qty_order: number;
    positions: ProductPosition[];
}

function _addProducts(products: Product[] | undefined): any {
    if (!products) return [];

    return products.map((product) => {
        return {
            product_id: product.product_id,
            product_sku: product.product_sku || '',
            product_name: product.product_name || '',
            product_position: product.product_position || '',
            height: product.height || 0,
            width: product.width || 0,
            length: product.length || 0,
            weight: product.weight || 0,
            note: product.note || '',
            stock: product.stock || 0,
            qty_order: product.qty_order || 0,
            positions: (product.positions as ProductPosition[]) || []
        };
    });
}

export interface MainOrder {
    id: number;
    created_at: string;
    customer: Customer;
    warehouse: string;
    address: Address;
    extra_data: ExtraData;
    note: string;
    warehouse_note: string | null;
    products: Product[];
    picking_group: number | null | undefined;
}

export class Order implements MainOrder {
    id!: number;
    created_at!: string;
    customer!: Customer;
    warehouse!: string;
    address!: Address;
    extra_data!: ExtraData;
    note!: string;
    warehouse_note!: string | null;
    products!: Product[];
    picking_group: number | null | undefined;

    private constructor(params: MainOrder) {
        Object.assign(this, params);
    }

    static create(data: Partial<MainOrder>): Order {
        const products = _addProducts(data.products);
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
            products: products,
            picking_group: data.picking_group
        });
    }
}

export type PositionAgg = {
    position: string;
    qty: number;
};
