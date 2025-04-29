export interface Box {
    id: number;
    box_qty: number;
    box_width_cm: number;
    box_length_cm: number;
    box_height_cm: number;
    products: {p_code: string; quantity: number}[];
}

export interface Delivery {
    id: number;
    creation_date: Date;
    boxes: Box[];
}

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

interface Cost {
    shipping_cost: string;
    inner_cost: any[]; // can refine if you have structure
}

export interface Product {
    product_id: number;
    product_sku: string;
    product_name: string;
    position: string;
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
    customer_id: number;
    current_wh: number;
    address: Address;
    status: string;
    extra_data: ExtraData;
    cost: Cost;
    note: string;
    warehouse_note: string | null;
    products: Product[];
    files: any[]; // again, if you know files structure better, type it
    invoice_n: string | null;
    billing_cycle: string | null;
}

export class Order implements MainOrder {
    id: number;
    created_at: string;
    customer: Customer;
    customer_id: number;
    current_wh: number;
    address: Address;
    status: string;
    extra_data: ExtraData;
    cost: Cost;
    note: string;
    warehouse_note: string | null;
    products: Product[];
    files: any[];
    invoice_n: string | null;
    billing_cycle: string | null;

    private constructor(params: MainOrder) {
        Object.assign(this, params);
    }

    static create(data): Order {
        return new Order({
            id: data.id ?? 0,
            created_at: data.created_at ?? new Date().toISOString(),
            customer: data.customer ?? {
                customer_id: 0,
                company_id: 0,
                company_name: "",
            },
            customer_id: data.customer_id ?? 0,
            current_wh: data.current_wh ?? 0,
            address: data.address ?? {
                business_name: "",
                reference_name: "",
                address: "",
                city: "",
                street: "",
                province: "",
                country: "",
                zip_code: "",
                email: "",
                tel: "",
            },
            status: data.status ?? "",
            extra_data: data.extra_data ?? {
                courier_data: {
                    courier_name: "",
                    courier_tracking: ""
                },
                customer_reference: "",
                reference_name: "",
                provider: ""
            },
            cost: data.cost ?? {
                shipping_cost: "0.00",
                inner_cost: [],
            },
            note: data.note ?? "",
            warehouse_note: data.warehouse_note ?? null,
            products: data.products ?? [],
            files: data.files ?? [],
            invoice_n: data.invoice_n ?? null,
            billing_cycle: data.billing_cycle ?? null,
        });
    }
}
