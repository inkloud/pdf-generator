export interface DeliveryBoxProduct {
    id: number;
    wh_delivery_box_id: number;
    product_id: number;
    quantity: number;
    p_code: string;
    p_title: string;
    p_position: string;
    p_unit_type: string;
    p_weight_kg: number;
    p_height_cm: number;
    p_length_cm: number;
    p_width_cm: number;
}

export interface DeliveryBox {
    id: number;
    delivery_id: number;
    box_height_cm: string;
    box_length_cm: string;
    box_width_cm: string;
    box_weight_kg: string;
    box_qty: number;
    products: DeliveryBoxProduct[];
}

interface DeliveryCostItem {
    id: number;
    descr: string;
    qty: number;
    cost: string;
}

interface DeliveryCost {
    shipping_cost: string;
    inner_cost: DeliveryCostItem[];
}

export interface DeliveryType {
    id: number;
    company_id: number;
    customer_id: number;
    company_name: string;
    warehouse_id: number;
    d_state: string;
    creation_date: string;
    wh_note: string;
    invoice_n: number;
    courier_name: string;
    courier_tracking: string;
    boxes: DeliveryBox[];
    cost: DeliveryCost;
    billing_cicle: string | null;
}

export class Delivery implements DeliveryType {
    id: number;
    company_id: number;
    customer_id: number;
    company_name: string;
    warehouse_id: number;
    d_state: string;
    creation_date: string;
    wh_note: string;
    invoice_n: number;
    courier_name: string;
    courier_tracking: string;
    boxes: DeliveryBox[];
    cost: DeliveryCost;
    billing_cicle: string | null;

    private constructor(params: DeliveryType) {
        Object.assign(this, params);
    }

    static create(data: Partial<DeliveryType>): Delivery {
        return new Delivery({
            id: data.id ?? 0,
            company_id: data.company_id ?? 0,
            company_name: data.company_name ?? "",
            customer_id: data.customer_id ?? 0,
            warehouse_id: data.warehouse_id ?? 0,
            d_state: data.d_state ?? "",
            creation_date: data.creation_date ?? new Date().toISOString(),
            wh_note: data.wh_note ?? "",
            invoice_n: data.invoice_n ?? 0,
            courier_name: data.courier_name ?? "",
            courier_tracking: data.courier_tracking ?? "",
            boxes: data.boxes ?? [],
            cost: data.cost ?? {
                shipping_cost: "0",
                inner_cost: []
            },
            billing_cicle: data.billing_cicle ?? null
        });
    }
}
