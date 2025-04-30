import React from 'react';

import { StyleSheet, Text, View } from '@react-pdf/renderer';
import {Product} from "./type";

const styles = StyleSheet.create({
    table: {
        display: 'flex',
        marginBottom: 16,
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0
    },
    tableRow: {
        flexDirection: 'row'
    },
    tableCol: {
        width: '20%', // 5 columns = 100 / 5 = 20%
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0
    },
    tableCell: {
        margin: 8,
        fontSize: 10
    },
    tableHeaderRow: {
        backgroundColor: '#f0f0f0'
    },
    tableHeaderCell: {
        margin: 8,
        fontSize: 10,
        fontWeight: 'bold'
    }
});

export const Table: React.FC<{ products: Product[] }> = ({ products }) => {
    const headers = ['No.', 'Product', 'Name', 'Location', 'Quantity'];

    return (
        <View style={styles.table}>
            {/* Header row */}
            <View style={[styles.tableRow, styles.tableHeaderRow]} wrap={false}>
                {headers.map((header, i) => (
                    <View key={i} style={styles.tableCol}>
                        <Text style={styles.tableHeaderCell}>{header}</Text>
                    </View>
                ))}
            </View>

            {/* Data rows */}
            {products.map((product, rowIndex) => (
                <View key={rowIndex} style={styles.tableRow} wrap={false}>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{rowIndex + 1}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{product.product_sku}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{product.product_name}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{product.position}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{product.stock}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};
