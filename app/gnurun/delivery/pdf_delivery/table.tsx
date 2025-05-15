import {StyleSheet, Text, View} from '@react-pdf/renderer';
import React from 'react';
import {DeliveryBoxProduct} from "../../../types/delivery";

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
    tableRow: {flexDirection: 'row'},
    tableCol: {width: '25%', borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0},
    tableCell: {margin: 8, fontSize: 10},
    tableHeaderRow: {backgroundColor: '#f0f0f0'},
    tableHeaderCell: {margin: 8, fontSize: 10, fontWeight: 'bold'}
});

export const Table: React.FC<{products: DeliveryBoxProduct[]}> = function ({products}) {
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
                        <Text style={styles.tableCell}>{product.p_code}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{product.p_title}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{product.p_position}</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableCell}>{product.quantity}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};