import React from "react";

import {Document, Image, Page, Text, View} from "@react-pdf/renderer";
import {formatAddress, formatDate, getBarcode, getLogo} from "@/app/utils/formating";
import {GroupedProduct, Order, Product, ProductOrderEntry} from "@/app/types/fulfillment";
import {groupByPickingGroup} from "@/app/utils/sorting";
import {styles} from "./style";

const uniquePositionsFromEntries = (entries: ProductOrderEntry[]) => {
    const seen = new Set<string>();
    const out: { position: string; qty: number }[] = [];

    for (const entry of entries) {
        const position = (entry.position || "").trim();
        if (!position || seen.has(position)) continue;

        seen.add(position);
        out.push({position, qty: 0});
    }

    return out;
};

const calcGroupQty = (group: GroupedProduct) => {
    const qtyByOrder = new Map<number, number>();

    for (const entry of group.orders) {
        qtyByOrder.set(entry.order_id, (qtyByOrder.get(entry.order_id) ?? 0) + (entry.quantity ?? 0));
    }

    const perOrderQtys = Array.from(qtyByOrder.values());
    const ordersCount = perOrderQtys.length;
    const stockPerOrder = perOrderQtys[0] ?? 0;
    const totalQty = perOrderQtys.reduce((sum, quantity) => sum + quantity, 0);

    return {ordersCount, stockPerOrder, totalQty};
};

const totalsForProduct = (product: Product, totalQty: number) => {
    const unitVolume = (product.length ?? 0) * (product.width ?? 0) * (product.height ?? 0);

    return {
        weight: (product.weight ?? 0) * totalQty,
        volume: unitVolume * totalQty,
        quantity: totalQty,
    };
};

const totalsForAll = (rows: Array<{ product: Product; totalQty: number }>) => rows.reduce(
    (acc, row) => {
        const totals = totalsForProduct(row.product, row.totalQty);
        acc.weight += totals.weight;
        acc.volume += totals.volume;
        acc.quantity += totals.quantity;
        return acc;
    },
    {weight: 0, volume: 0, quantity: 0}
);

const formatDecimal = (value: number, maxDecimals = 3) => Number(value.toFixed(maxDecimals)).toString();

const Barcode = ({picking_group}: { picking_group: number | null | undefined }) => {
    if (!picking_group) return null;

    return (
        <View style={styles.barcodeContainer}>
            <Image style={styles.barcode} src={getBarcode(picking_group.toString())}/>
            <Text style={styles.barcodeId}>{picking_group}</Text>
        </View>
    );
};

const PageNumber = () => (
    <Text
        style={styles.pageNumber}
        render={({pageNumber, totalPages}) => `Page ${pageNumber} of ${totalPages}`}
        fixed
    />
);

const OrderHeader: React.FC<{ order: Order }> = ({order}) => (
    <>
        <View style={{marginBottom: 24}}>
            <Text style={styles.title}>Picking List</Text>
            <View style={styles.topHeaderRow}>
                <Image style={styles.logo} src={getLogo()}/>
                <View style={styles.barcodeContainer}>
                    <Image style={styles.barcode} src={getBarcode(order.id.toString())}/>
                    <Text style={styles.barcodeId}>ID: {order.id}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.infoBox}>
                <View style={styles.box}>
                    <Text><Text style={styles.label}>Fulfillment ID:</Text> {order.id}</Text>
                    <Text><Text style={styles.label}>Date:</Text> {formatDate(order.created_at)}</Text>
                    <Text><Text style={styles.label}>Doc. number:</Text> {order.id}</Text>
                </View>
                <View style={styles.box}>
                    <Text><Text style={styles.label}>Courier:</Text> {order.extra_data.courier_data?.courier_name}</Text>
                    <Text><Text style={styles.label}>Customer ref:</Text> {order.extra_data.customer_reference}</Text>
                </View>
            </View>
        </View>

        <View style={styles.section}>
            <View style={styles.infoBox}>
                <View style={styles.box}>
                    <Text><Text style={styles.label}>Sender:</Text> {order.customer.company_name}</Text>
                    <Text><Text style={styles.label}>Warehouse:</Text> {order.warehouse}</Text>
                </View>
                <View style={styles.box}>
                    <Text><Text style={styles.label}>Destination:</Text> {formatAddress(order.address)}</Text>
                </View>
            </View>
        </View>
    </>
);

const getDistribution = (product: Product) => {
    const quantitiesByPosition = new Map<string, number>();

    for (const position of product.positions ?? []) {
        const positionName = (position.wh_position || product.product_position || '').trim();
        if (!positionName) continue;

        const quantity = position.qty_order ?? position.stock;
        quantitiesByPosition.set(
            positionName,
            (quantitiesByPosition.get(positionName) ?? 0) + quantity
        );
    }

    if (quantitiesByPosition.size === 0) {
        return [{quantity: product.stock, position: product.product_position}];
    }

    return Array.from(quantitiesByPosition, ([position, quantity]) => ({quantity, position}));
};

const mergeOrderProducts = (products: Product[]) => {
    const productsByKey = new Map<string, Product>();

    for (const product of products) {
        const key = product.product_id !== undefined && product.product_id !== null
            ? `id:${product.product_id}`
            : `sku:${product.product_sku ?? ''}`;
        const existing = productsByKey.get(key);

        if (!existing) {
            productsByKey.set(key, {
                ...product,
                positions: [...(product.positions ?? [])],
            });
            continue;
        }

        existing.qty_order += product.qty_order ?? 0;
        existing.stock += product.stock ?? 0;
        existing.positions.push(...(product.positions ?? []));
    }

    return Array.from(productsByKey.values());
};

const OrderProducts: React.FC<{ products: Product[] }> = ({products}) => (
    <>
        <View style={styles.tableHeader}>
            <Text style={[styles.cell, {flex: 1}]}>Code</Text>
            <Text style={[styles.cell, {flex: 2}]}>Description</Text>
            <Text style={[styles.cell, {flex: 1}]}>Qty order</Text>
            <Text style={[styles.cell, {flex: 1}]}>Quantity</Text>
            <Text style={[styles.cell, {flex: 1}]}>Position</Text>
        </View>

        <View style={styles.borderedView}>
            {mergeOrderProducts(products).map((product, index) => {
                const distribution = getDistribution(product);

                return (
                    <View key={`${product.product_id}-${index}`} style={styles.tableRow} wrap={false}>
                        {/* Product columns are rendered once; only Quantity and Position expand. */}
                        <View style={[styles.cell, {flex: 1}]}>
                            <Text>{product.product_sku}</Text>
                        </View>
                        <View style={[styles.cell, {flex: 2}]}>
                            <Text>{product.product_name}</Text>
                        </View>
                        <View style={[styles.cell, {flex: 1}]}>
                            <Text>{product.qty_order}</Text>
                        </View>

                        <View style={{flex: 2, flexDirection: 'row'}}>
                            <View style={{flex: 1}}>
                                {distribution.map((entry, entryIndex) => (
                                    <Text key={`quantity-${entry.position}-${entryIndex}`} style={{paddingHorizontal: 4, minHeight: 16}}>
                                        {entry.quantity}
                                    </Text>
                                ))}
                            </View>
                            <View style={{flex: 1}}>
                                {distribution.map((entry, entryIndex) => (
                                    <Text key={`position-${entry.position}-${entryIndex}`} style={{paddingHorizontal: 4, minHeight: 16}}>
                                        {entry.position}
                                    </Text>
                                ))}
                            </View>
                        </View>
                    </View>
                );
            })}
        </View>
    </>
);
const OrderFooter: React.FC<{ order: Order }> = ({order}) => {
    const totals = mergeOrderProducts(order.products).reduce(
        (acc, product) => ({
            weight: acc.weight + product.weight * product.qty_order,
            volume: acc.volume + product.length * product.width * product.height * product.qty_order,
            quantity: acc.quantity + product.stock,
        }),
        {weight: 0, volume: 0, quantity: 0}
    );

    return (
        <View style={styles.summaryTable}>
            <View style={styles.tableHeader}>
                <Text style={[styles.cell, {flex: 1}]}>Total Weight</Text>
                <Text style={[styles.cell, {flex: 1}]}>Total Volume</Text>
                <Text style={[styles.cell, {flex: 1}]}>Total Quantity</Text>
            </View>
            <View style={styles.tableRow}>
                <Text style={[styles.cell, {flex: 1}]}>{formatDecimal(totals.weight)} kg</Text>
                <Text style={[styles.cell, {flex: 1}]}>{formatDecimal(totals.volume)} cm3</Text>
                <Text style={[styles.cell, {flex: 1}]}>{totals.quantity}</Text>
            </View>
        </View>
    );
};

export const GroupedProductPDFBackoffice: React.FC<{
    orders: GroupedProduct[];
    sourceOrders: Order[];
}> = ({orders, sourceOrders}) => {
    const groups = groupByPickingGroup(orders);

    return (
        <Document>
            {groups.map((group) => {
                const rows = group.items.map((item) => {
                    const positions = uniquePositionsFromEntries(item.orders);
                    const {ordersCount, stockPerOrder, totalQty} = calcGroupQty(item);

                    return {
                        product: item.product,
                        positions,
                        ordersCount,
                        stockPerOrder,
                        totalQty,
                    };
                });

                const grand = totalsForAll(rows.map((row) => ({
                    product: row.product,
                    totalQty: row.totalQty,
                })));

                const groupOrders = sourceOrders.filter(
                    (order) => (order.picking_group ?? null) === group.picking_group
                );

                return (
                    <React.Fragment key={group.key}>
                        <Page size="A4" style={styles.page}>
                            <View>
                                <Text style={styles.title}>Picking List</Text>
                                <View style={styles.topHeaderRow}>
                                    <Image style={styles.logo} src={getLogo()}/>
                                    <Barcode picking_group={group.picking_group}/>
                                </View>
                            </View>

                            <View style={styles.tableHeader}>
                                <Text style={[styles.cell, {flex: 0.5}]}>No.</Text>
                                <Text style={[styles.cell, {flex: 1}]}>Code</Text>
                                <Text style={[styles.cell, {flex: 2}]}>Product</Text>
                                <Text style={[styles.cell, {flex: 2}]}>Position</Text>
                                <Text style={[styles.cell, {flex: 1.2}]}>Qty</Text>
                                <Text style={[styles.cell, {flex: 0.8}]}>Total</Text>
                            </View>

                            <View style={styles.borderedView}>
                                {rows.map((row, index) => (
                                    <View key={`${group.key}-${row.product.product_id ?? index}`} style={styles.tableRow}>
                                        <Text style={[styles.cell, {flex: 0.5}]}>{index + 1}</Text>
                                        <Text style={[styles.cell, {flex: 1}]}>{row.product.product_sku}</Text>
                                        <Text style={[styles.cell, {flex: 2}]}>{row.product.product_name}</Text>
                                        <View style={[styles.cell, {flex: 2}]}>
                                            {row.positions.map((position, positionIndex) => (
                                                <Text key={`pos-${index}-${positionIndex}`}>{position.position}</Text>
                                            ))}
                                        </View>
                                        <View style={[styles.cell, {flex: 1.2}]}>
                                            {row.positions.map((_, positionIndex) => (
                                                <Text key={`qty-${index}-${positionIndex}`}>
                                                    {positionIndex === 0 ? `${row.ordersCount} x ${row.stockPerOrder}` : ""}
                                                </Text>
                                            ))}
                                        </View>
                                        <Text style={[styles.cell, {flex: 0.8}]}>{row.totalQty}</Text>
                                    </View>
                                ))}
                            </View>

                            <View style={styles.summaryTable}>
                                <View style={styles.tableHeader}>
                                    <Text style={[styles.cell, {flex: 1}]}>Total weight</Text>
                                    <Text style={[styles.cell, {flex: 1}]}>Volume</Text>
                                    <Text style={[styles.cell, {flex: 1}]}>Total qty</Text>
                                </View>
                                <View style={styles.tableRow}>
                                    <Text style={[styles.cell, {flex: 1}]}>{formatDecimal(grand.weight)} kg</Text>
                                    <Text style={[styles.cell, {flex: 1}]}>{formatDecimal(grand.volume)} cm3</Text>
                                    <Text style={[styles.cell, {flex: 1}]}>{grand.quantity}</Text>
                                </View>
                            </View>

                            <PageNumber/>
                        </Page>

                        {groupOrders.map((order) => (
                            <Page key={`order-${order.id}`} size="A4" style={styles.page}>
                                <OrderHeader order={order}/>
                                <OrderProducts products={order.products}/>
                                <OrderFooter order={order}/>
                                <PageNumber/>
                            </Page>
                        ))}
                    </React.Fragment>
                );
            })}
        </Document>
    );
};
