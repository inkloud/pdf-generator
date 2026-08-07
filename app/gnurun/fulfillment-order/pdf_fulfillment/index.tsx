import React from "react";

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./style";
import { formatAddress, formatDate, getBarcode, getLogo } from "../../../utils/formating";
import { Order, Product } from "../../../types/fulfillment";

const typeKeyForProduct = (product: Product) => (
    product.product_id !== undefined && product.product_id !== null
        ? `id:${product.product_id}`
        : `sku:${product.product_sku ?? ''}`
);

const mergeOrderProducts = (products: Product[]) => {
    const productsByKey = new Map<string, Product>();

    for (const product of products) {
        const key = typeKeyForProduct(product);
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

type Distribution = {
    quantity: number;
    position: string;
};

const getDistribution = (product: Product): Distribution[] => {
    const quantitiesByPosition = new Map<string, number>();

    for (const position of product.positions ?? []) {
        const positionName = (position.wh_position || product.product_position || '').trim();
        if (!positionName) continue;

        quantitiesByPosition.set(
            positionName,
            (quantitiesByPosition.get(positionName) ?? 0) + position.stock
        );
    }

    if (quantitiesByPosition.size === 0) {
        return [{quantity: product.stock, position: product.product_position}];
    }

    return Array.from(quantitiesByPosition, ([position, quantity]) => ({quantity, position}));
};

const checkTotals = (order: Order) => {
    const totals = {weight: 0, quantity: 0, volume: 0};

    mergeOrderProducts(order.products).forEach((product) => {
        totals.weight += product.weight * product.qty_order;
        totals.quantity += getDistribution(product).reduce(
            (total, entry) => total + entry.quantity,
            0
        );
        totals.volume += product.length * product.width * product.height * product.qty_order;
    });

    return totals;
};

const formatDecimal = (value: number, maxDecimals = 3) => {
    return Number(value.toFixed(maxDecimals)).toString();
};

export const FulfillmentPDF: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Header order={order} />
                <Products products={order.products} />
                <Footer order={order} />
            </Page>
        </Document>
    );
};

const Header: React.FC<{ order: Order }> = ({ order }) => {
    return (
        <>
            <View style={{ marginBottom: 24 }}>
                <Text style={styles.title}>Picking List</Text>

                <View style={styles.topHeaderRow}>
                    <Image style={styles.logo} src={getLogo()} />

                    <View style={styles.barcodeContainer}>
                        <Image style={styles.barcode} src={getBarcode(order.id.toString())} />
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
};

const Products: React.FC<{ products: Product[] }> = ({products}) => {
    const mergedProducts = mergeOrderProducts(products);

    return (
        <>
            <View style={styles.tableHeader}>
                <Text style={[styles.cell, {flex: 1}]}>Code</Text>
                <Text style={[styles.cell, {flex: 2}]}>Description</Text>
                <Text style={[styles.cell, {flex: 1}]}>Qty order</Text>
                <Text style={[styles.cell, {flex: 1}]}>Quantity</Text>
                <Text style={[styles.cell, {flex: 1}]}>Position</Text>
            </View>

            {mergedProducts.map((product, index) => {
                const distribution = getDistribution(product);

                return (
                    <View key={`${product.product_id}-${index}`} style={styles.tableRow} wrap={false}>
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
        </>
    );
};

const Footer: React.FC<{ order: Order }> = ({ order }) => {
    const totals = checkTotals(order);

    return (
        <>
            <View style={styles.summaryTable}>
                <View style={styles.tableHeader}>
                    <Text style={[styles.cell, { flex: 1 }]}>Total Weight</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Total Volume</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>Total Quantity</Text>
                </View>

                <View style={styles.tableRow}>
                    <Text style={[styles.cell, { flex: 1 }]}>{formatDecimal(totals.weight)} kg</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>{formatDecimal(totals.volume)} cm3</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{totals.quantity}</Text>
                </View>
            </View>

            <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                fixed
            />
        </>
    );
};
