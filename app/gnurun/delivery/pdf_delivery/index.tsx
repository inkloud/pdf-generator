import {Document, Image, Page, Text, View} from '@react-pdf/renderer';

import React from 'react';
import {Delivery, DeliveryBox, DeliveryBoxProduct} from '../../../types/delivery';
import {formatDate, getBarcode, getLogo} from '../../../utils/formating';
import {styles} from './style';
import {Table} from './table';

const checkTotals = function (delivery: Delivery) {
    function getVolume(product: DeliveryBoxProduct) {
        return product.p_height_cm * product.p_width_cm * product.p_length_cm * product.quantity;
    }

    const totals = {weight: 0, quantity: 0, volume: 0};
    if (delivery.boxes.length > 0) {
        delivery.boxes.forEach((box: DeliveryBox) => {
            const boxCount = box.box_qty || 1;
            box.products.forEach((product) => {
                totals.volume += getVolume(product) * boxCount;
                totals.quantity += product.quantity * boxCount;
                totals.weight += product.p_weight_kg * boxCount;
            });
        });
        return totals;
    } else {
        return totals;
    }
};
const Header: React.FC<{delivery: Delivery}> = function ({delivery}) {
    return (
        <>
            <View style={styles.titleContainer}>
                <Text style={styles.title}>Inbound List</Text>
                <View style={styles.topHeaderRow}>
                    <Image style={styles.logo} src={getLogo()} />

                    <View style={styles.barcodeContainer}>
                        <Image style={styles.barcode} src={getBarcode(delivery.id.toString())} />
                        <Text style={styles.barcodeId}>ID: {delivery.id}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.infoBox}>
                    <View style={styles.box}>
                        <Text><Text style={styles.label}>Delivery ID:</Text> {delivery.id}</Text>
                        <Text><Text style={styles.label}>Date:</Text> {formatDate(delivery.creation_date)}</Text>
                        <Text><Text style={styles.label}>Doc. number:</Text> {delivery.id}</Text>
                    </View>
                    <View style={[styles.box, styles.rightBox]}>
                        <Text><Text style={styles.label}>Courier:</Text> {delivery.courier_name}</Text>
                        <Text><Text style={styles.label}>Customer ref:</Text> {delivery.customer_id}</Text>
                    </View>
                </View>
            </View>

            <View style={styles.section}>
                <View style={styles.infoBox}>
                    <View style={styles.box}>
                        <Text><Text style={styles.label}>Sender:</Text> {delivery.company_name}</Text>
                        <Text><Text style={styles.label}>Warehouse:</Text> {delivery.warehouse_id}</Text>
                    </View>
                    <View style={[styles.box, styles.rightBox]}>
                        <Text><Text style={styles.label}>Tracking:</Text> {delivery.courier_tracking}</Text>
                    </View>
                </View>
            </View>
        </>
    );
};

const Footer: React.FC<{delivery: Delivery}> = function ({delivery}) {
    const totals = checkTotals(delivery);
    return (
        <>
            <View style={styles.summaryTable}>
                <View style={styles.tableHeader}>
                    <Text style={styles.cell}>Total Weight</Text>
                    <Text style={styles.cell}>Total Volume</Text>
                    <Text style={styles.cell}>Total Quantity</Text>
                </View>
                <View style={styles.tableRow}>
                    <Text style={styles.cell}>{totals.weight} kg</Text>
                    <Text style={styles.cell}>{totals.volume} cm3</Text>
                    <Text style={styles.cell}>{totals.quantity}</Text>
                </View>
            </View>
            <Text
                style={styles.footer}
                fixed
                render={({pageNumber, totalPages}) => `Page ${pageNumber} of ${totalPages}`}
            />
        </>
    );
};

const getProductKey = (product: DeliveryBoxProduct) => {
    if (product.product_id) return `id:${product.product_id}`;

    return [product.p_code, product.sku_code, product.product_sku, product.p_title, product.product_name]
        .filter(Boolean)
        .join('|');
};

const mergeProducts = (boxes: DeliveryBox[]) => {
    const productsByKey = new Map<string, DeliveryBoxProduct>();

    for (const box of boxes) {
        const boxCount = box.box_qty || 1;
        for (const product of box.products) {
            const quantity = product.quantity * boxCount;
            const key = getProductKey(product);
            const existing = productsByKey.get(key);

            if (existing) {
                existing.quantity += quantity;
            } else {
                productsByKey.set(key, {...product, quantity});
            }
        }
    }

    return Array.from(productsByKey.values());
};

export const DeliveryPDF: React.FC<{
    delivery: Delivery;
    company_name: string;
    courier_name: string;
    courier_tracking: string;
}> = function ({delivery, company_name, courier_name, courier_tracking}) {
    const products = mergeProducts(delivery.boxes);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                <Header delivery={delivery} />
                <Table products={products} />
                <Footer delivery={delivery} />
            </Page>
        </Document>
    );
};
