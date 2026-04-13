import React from "react";

import {Document, Image, Page, Text, View} from '@react-pdf/renderer';
import {styles} from './style';
import {formatAddress, formatDate, getBarcode, getLogo} from "../../../utils/formating";
import {Order, Product} from "../../../types/fulfillment";

const checkTotals = (order: Order) => {
    const totals = { weight: 0, quantity: 0, volume: 0 };
    order.products.forEach((p) => {
        totals.weight += p.weight;
        totals.quantity += p.stock;
        totals.volume += p.length * p.width * p.height * p.stock;
    });
    return totals;
};

type ProductRow = {
    product: Product;
    orderQuantity: number;
    quantity: number;
    position: string;
};

const splitPositions = (productPosition: string): string[] => {
    return productPosition
        .split(/\r?\n|[,;|]+/)
        .map((position) => position.trim())
        .filter(Boolean);
};

const getProductRows = (products: Product[]): ProductRow[] => {
    return products.flatMap((product) => {
        const orderQuantity = product.stock;
        const positions = splitPositions(product.product_position);

        if (!positions.length) {
            return [{
                product,
                orderQuantity,
                quantity: orderQuantity,
                position: product.product_position,
            }];
        }

        if (positions.length === orderQuantity) {
            return positions.map((position) => ({
                product,
                orderQuantity,
                quantity: 1,
                position,
            }));
        }

        return [{
            product,
            orderQuantity,
            quantity: orderQuantity,
            position: positions.join(", "),
        }];
    });
};

export const FulfillmentPDF: React.FC<{ order: Order }> = ({ order }) => {

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Products Table */}
                <Header order={order}/>

                {/* Products Table */}
                <Products products={order.products} />

                {/* Footer */}
                <Footer order={order} />
            </Page>
        </Document>
    );
};

const Header: React.FC<{ order: Order }> = ({order}) => {
    return(
        <>
            {/* Logo and Title */}
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

            {/* Order Info */}
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

            {/* Address Info */}
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
    )
}

const Products: React.FC<{ products: Product[] }> = ({ products }) => {
    const rows = getProductRows(products);

    return(
        <>
            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.cell, { flex: 1 }]}>No.</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Barcode</Text>
                <Text style={[styles.cell, { flex: 2 }]}>Product</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Position</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Qty order</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Quantity</Text>
            </View>

            {rows.map((row, i) => (
                <View key={i} style={styles.tableRow}>
                    <Text style={[styles.cell]}>{i+1}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{row.product.product_sku}</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>{row.product.product_name}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{row.position}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{row.orderQuantity}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{row.quantity}</Text>
                </View>
            ))}
        </>
    )
}

const Footer: React.FC<{ order: Order }> = ({order}) => {
    const totals = checkTotals(order);
    return(
        <>
            {/* Totals */}
            <View style={styles.summaryTable}>
                {/* Totals Header */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.cell, { flex: 1 }]}>Total Weight</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Total Volume</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>Total Quantity</Text>
                </View>

                {/* Totals Values*/}
                <View style={styles.tableRow}>
                    <Text style={[styles.cell, { flex: 1 }]}>{totals.weight} kg</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>{totals.volume} cm³</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{totals.quantity}</Text>
                </View>
            </View>


            {/* Page Number */}
            <Text
                style={styles.pageNumber}
                render={({ pageNumber, totalPages }) =>
                    `Page ${pageNumber} of ${totalPages}`
                }
                fixed
            />
        </>
    )
}
