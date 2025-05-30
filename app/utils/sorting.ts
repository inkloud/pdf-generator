import {GroupedProduct, Order} from "../types/fulfillment";

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