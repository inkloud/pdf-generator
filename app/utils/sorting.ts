import {GroupedProduct, Order} from "../types/fulfillment";

export type QtyLine = {
    position: string;
    qtyText: string;
    qty: number;
};

export const buildQtyLines = (
    positions: { position: string; qty: number }[]
): QtyLine[] => {
    const qtyToPositions = new Map<number, string[]>();

    for (const p of positions) {
        const list = qtyToPositions.get(p.qty) ?? [];
        list.push(p.position);
        qtyToPositions.set(p.qty, list);
    }

    const lines: QtyLine[] = [];

    for (const [qty, posList] of qtyToPositions.entries()) {
        const count = posList.length;

        posList.forEach((pos, idx) => {
            lines.push({
                position: pos,
                qty,
                qtyText: idx === 0 ? `${count} x ${qty}` : "",
            });
        });
    }

    return lines;
};


export function groupOrdersByProduct(orders: Order[]): GroupedProduct[] {
    const groupedMap: Map<number, GroupedProduct> = new Map();

    for (const order of orders) {
        for (const product of order.products) {
            const pid = product.product_id;

            if (!groupedMap.has(pid)) {
                groupedMap.set(pid, {
                    product,
                    orders: [],
                });
            }

            groupedMap.get(pid)!.orders.push({
                order_id: order.id,
                customer_name: order.customer.company_name,
                warehouse: order.warehouse,
                quantity: product.stock,
                position: product.product_position,
                address: order.address,
            });
        }
    }

    return Array.from(groupedMap.values());
}
