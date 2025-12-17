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

type FlatRow = {
    key: string
    product_sku: string
    product_name: string
    wh_position: string
    stock: number
}

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
                        <Text style={styles.barcodeText}>{getBarcode(order.id.toString())}</Text>
                        <Text style={styles.barcodeId}>{order.id}</Text>
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

function buildProductPositionRows(products: Product[]): FlatRow[] {
    const rows: FlatRow[] = []

    for (const p of products) {
        const map: Record<string, number> = {}

        for (const pos of p.positions ?? []) {
            map[pos.wh_position] = (map[pos.wh_position] || 0) + pos.stock
        }

        for (const [wh_position, stock] of Object.entries(map)) {
            rows.push({
                key: `${p.product_id}-${wh_position}`, // stable key
                product_sku: p.product_sku,
                product_name: p.product_name,
                wh_position,
                stock,
            })
        }
    }

    return rows
}

const Products: React.FC<{ products: Product[] }> = ({ products }) => {
    const rows = buildProductPositionRows(products)

    return(
        <>
            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.cell, { flex: 1 }]}>SKU</Text>
                <Text style={[styles.cell, { flex: 2 }]}>Product</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Quantity</Text>
                <Text style={[styles.cell, { flex: 1 }]}>Position</Text>
            </View>

            {rows.map((r) => (
                <View key={r.key} style={styles.tableRow}>
                    <Text style={[styles.cell, { flex: 1 }]}>{r.product_sku}</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>{r.product_name}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{r.stock}</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{r.wh_position}</Text>
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
                    <Text style={[styles.cell, { flex: 1 }]}>Total weight</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Total volume</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>Total quantity</Text>
                </View>

                {/* Totals Values*/}
                <View style={styles.tableRow}>
                    <Text style={[styles.cell, { flex: 1 }]}>{totals.weight} kg</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>{totals.volume} cm³</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>{totals.quantity}</Text>
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