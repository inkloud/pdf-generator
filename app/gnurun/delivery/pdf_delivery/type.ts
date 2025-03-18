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
