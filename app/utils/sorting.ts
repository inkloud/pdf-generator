import {GroupedProduct, Order} from "../types/fulfillment";

export type QtyLine = {
    position: string;
    qtyText: string;
    qty: number;
};

const getPickingGroupKey = (g: GroupedProduct) => {
    const pg = g.orders?.[0]?.picking_group;
    return (pg === null || pg === undefined) ? "NO_GROUP" : String(pg);
};

export const groupByPickingGroup = (items: GroupedProduct[]) => {
    const map = new Map<string, GroupedProduct[]>();

    for (const g of items) {
        const key = getPickingGroupKey(g);
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(g);
    }

    const keys = Array.from(map.keys()).sort((a, b) => {
        if (a === "NO_GROUP") return 1;
        if (b === "NO_GROUP") return -1;
        return Number(a) - Number(b);
    });

    return keys.map((key) => ({
        key,
        picking_group: key === "NO_GROUP" ? null : Number(key),
        items: map.get(key)!,
    }));
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
                picking_group: order.picking_group
            });
        }
    }

    return Array.from(groupedMap.values());
}

export function groupOrdersByProductPickingGroupFirst(orders: Order[]): GroupedProduct[] {
    const pgMap = new Map<string, Order[]>();

    for (const order of orders) {
        const pg = order.picking_group ?? null;
        const key = pg === null ? "NO_GROUP" : String(pg);

        if (!pgMap.has(key)) pgMap.set(key, []);
        pgMap.get(key)!.push(order);
    }

    // numeric sort; NO_GROUP last
    const keys = Array.from(pgMap.keys()).sort((a, b) => {
        if (a === "NO_GROUP") return 1;
        if (b === "NO_GROUP") return -1;
        return Number(a) - Number(b);
    });

    // group-by-product inside each picking group, then flatten
    const out: GroupedProduct[] = [];
    for (const key of keys) {
        const bucketOrders = pgMap.get(key)!;
        const grouped = groupOrdersByProduct(bucketOrders);

        // optional: stable product ordering inside each page
        grouped.sort((a, b) =>
            String(a.product.product_sku ?? "").localeCompare(String(b.product.product_sku ?? ""))
        );

        out.push(...grouped);
    }

    return out;
}