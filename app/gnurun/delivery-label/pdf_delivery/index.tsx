import fs from 'fs';

import {Document, Image, Page, StyleSheet, Text, View} from '@react-pdf/renderer';
import {Canvas} from 'canvas';
import Decimal from 'decimal.js';
import JsBarcode from 'jsbarcode';
import React from 'react';

interface Product {
    code: string;
    qty: number;
}

interface Box {
    products: Product[];
    weight: Decimal;
}

const styles = StyleSheet.create({
    page: {padding: 10},
    header: {flexDirection: 'row', justifyContent: 'center', marginBottom: 24},
    footer: {
        position: 'absolute',
        fontSize: 10,
        bottom: 16,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey'
    },
    table: {
        display: 'flex',
        marginBottom: 16,
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: {flexDirection: 'row'},
    tableCol: {width: '33.33%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0},
    tableCell: {margin: 8, fontSize: 10}
});

const Barcode: React.FC<{label: string}> = function ({label}) {
    const canvas = new Canvas(0, 0);
    JsBarcode(canvas, label, {width: 4});
    const dataUrl = canvas.toDataURL('image/png');

    return <Image src={dataUrl} />;
};

const Header: React.FC<{id: number; customer_id: number; index: number; length: number}> = function ({
    id,
    customer_id,
    index,
    length
}) {
    const label = `A${customer_id}-D${id}-${index + 1}/${length}`;
    return (
        <View style={styles.header}>
            <Barcode label={label} />
        </View>
    );
};

const Footer: React.FC<{weight: Decimal}> = function ({weight}) {
    const imageBuffer = fs.readFileSync('./app/gnurun/delivery-label/gnurun-hd.png');
    const base64 = imageBuffer.toString('base64');
    const imgSource = `data:image/png;base64,${base64}`;

    const formattedKg = new Intl.NumberFormat('en-US', {
        style: 'unit',
        unit: 'kilogram',
        unitDisplay: 'short',
        maximumFractionDigits: 2
    }).format(weight.toNumber());

    return (
        <View style={styles.footer}>
            <Text>DON&apos;T COVER THIS PAGE</Text>
            <Image src={imgSource} style={{width: 75, position: 'absolute', left: 5, bottom: 5}} />
            <Text style={{fontSize: 6, textAlign: 'right', color: 'black', margin: 10}}>Weight: {formattedKg}</Text>
        </View>
    );
};

const Body: React.FC<{products: Product[]}> = function ({products}) {
    const rows = products.map((product) => (
        <View key={product.code} style={styles.tableRow} wrap={false}>
            <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product.code}</Text>
            </View>
            <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{product.qty}</Text>
            </View>
            <View style={styles.tableCol}>
                <Barcode label={product.code} />
            </View>
        </View>
    ));
    return <View style={styles.table}>{rows}</View>;
};

const SinglePage: React.FC<{id: number; customer_id: number; box: Box; index: number; length: number}> = function ({
    id,
    customer_id,
    box,
    index,
    length
}) {
    return (
        <>
            <Header id={id} customer_id={customer_id} index={index} length={length} />
            <Body products={box.products} />
            <Footer weight={box.weight} />
        </>
    );
};

export const DeliveryPDF: React.FC<{id: number; customer_id: number; boxes: Box[]}> = function ({
    id,
    customer_id,
    boxes
}) {
    const pages = boxes.map((box, index) => (
        <Page key={index} size={{width: '3.93in', height: '5.51in'}} style={styles.page}>
            <SinglePage id={id} customer_id={customer_id} box={box} index={index} length={boxes.length} />
        </Page>
    ));

    return <Document>{pages}</Document>;
};
