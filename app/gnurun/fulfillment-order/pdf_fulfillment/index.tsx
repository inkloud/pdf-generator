import React from "react";

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./style";
import { formatAddress, formatDate, getBarcode, getLogo } from "../../../utils/formating";
import { Order, Product } from "../../../types/fulfillment";

const checkTotals = (order: Order) => {
    const totals = { weight: 0, quantity: 0, volume: 0 };
    // The total quantity is based on the stock sent with the order.
    // Totals for weight and volume are calculated from qty_order.
    order.products.forEach((p) => {
        totals.weight += p.weight * p.qty_order;
        totals.quantity += p.stock;
        totals.volume += p.length * p.width * p.height * p.qty_order;
    });
    return totals;
};

type Distribution = {
    quantity: number;
    position: string;
};

const getDistribution = (product: Product): Distribution[] => {
    if (product.positions && product.positions.length > 0) {
        return product.positions.map((p) => ({
            quantity: p.stock,
            position: p.wh_position,
        }));
    }
    return [{ quantity: product.stock, position: product.product_position }];
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

const Products: React.FC<{ products: Product[] }> = ({ products }) => {
    return (
        <>
            <View style={styles.tableHeader}>
                <Text style={[styles.cell, { flex: 1 }]}>Code</Text>
                <Text style={[styles.cell, { flex: 2 }]}>Description</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Qty order</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Quantity</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Position</Text>
            </View>

            {products.map((product, i) => {
                const distribution = getDistribution(product);
                return (
                    <View key={i} style={styles.tableRow}>
                        <Text style={[styles.cell, { flex: 1 }]}>{product.product_sku}</Text>
                        <Text style={[styles.cell, { flex: 2 }]}>{product.product_name}</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>{product.qty_order}</Text>
                        <View style={{ flex: 2, flexDirection: "column" }}>
                            {distribution.map((d, j) => (
                                <View key={j} style={{ flexDirection: "row" }}>
                                    <Text style={[styles.cell, { flex: 1 }]}>{d.quantity}</Text>
                                    <Text style={[styles.cell, { flex: 1 }]}>{d.position}</Text>
                                </View>
                            ))}
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
