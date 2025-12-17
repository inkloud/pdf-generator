import React from "react";

import { Document, Image, Page, Text, View } from '@react-pdf/renderer';
import { styles } from './style';
import {getBarcode, getLogo} from "../../../utils/formating";
import {GroupedProduct, Product, ProductOrderEntry} from "../../../types/fulfillment";

const checkTotals = (orders:  ProductOrderEntry[], product: Product) => {
    const totals = { weight: 0, quantity: 0, volume: 0 };

    totals.weight = product.weight*orders.length
    orders.forEach(order => totals.quantity+=order.quantity)
    totals.volume = (product.length*product.width*product.height*product.stock)*orders.length

    return totals;
};

export const GroupedProductPDF: React.FC<{ orders: GroupedProduct[] }> = ({ orders }) => {
    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Logo and Title */}
                <View>
                    <Text style={styles.title}>Picking List</Text>

                    <View style={styles.topHeaderRow}>
                        <Image style={styles.logo} src={getLogo()} />

                    </View>
                </View>
                {orders.map(({ product, orders }) => (
                    <View key={product.product_id} wrap={false}>

                        {/* Product Header */}
                        <View style={styles.productHeader}>
                            <Text style={styles.skuText}>{product.product_sku}</Text>
                            <View style={styles.productDetailsRow}>
                                <View style={styles.productDetailCell}>
                                    <Text>{product.product_name}</Text>
                                </View>
                                <View style={styles.productDetailCell}>
                                    <Text>{product.product_position}</Text>
                                </View>
                            </View>
                        </View>

                        {/* Table Header */}
                        <View style={styles.tableHeader}>
                            <Text style={[styles.cell, { flex: 1 }]}>Order</Text>
                            <Text style={styles.cell}>Sender</Text>
                            <Text style={styles.cell}>Warehouse</Text>
                            <Text style={styles.cell}>Address</Text>
                            <Text style={[styles.cell, { flex: 0.5 }]}>Product Qty</Text>
                        </View>

                        {/* Orders Table */}
                        {orders.map((o, i) => (
                            <View key={i} style={styles.tableRow} wrap={false}>
                                <View style={styles.barcodeBlock}>
                                    <Text style={styles.barcodeText}>{getBarcode(o.order_id.toString())}</Text>
                                    <Text>{o.order_id}</Text>
                                </View>
                                <Text style={styles.cell}>{o.customer_name}</Text>
                                <Text style={styles.cell}>{o.warehouse}</Text>
                                <Text style={styles.cell}>
                                    {[o.address.business_name, o.address.street, o.address.city, o.address.country, o.address.zip_code].filter(Boolean).join(", ")}
                                </Text>
                                <Text style={[styles.cell, { flex: 0.5 }]}>{o.quantity}</Text>
                            </View>
                        ))}
                        <ProductFooter orders={orders} product={product} />
                    </View>
                ))}

                {/* Page Number */}
                <Text
                    style={styles.pageNumber}
                    render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
                    fixed
                />
            </Page>
        </Document>
    );
};


const ProductFooter: React.FC<{ orders:  ProductOrderEntry[], product: Product }> = ({orders, product}) => {
    const totals = checkTotals(orders, product);
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
        </>
    )
}
