import {StyleSheet, Text, View} from '@react-pdf/renderer';
import React from 'react';
import {DeliveryBoxProduct} from '../../../types/delivery';

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
    tableCol: {borderStyle: 'solid', borderWidth: 1, borderLeftWidth: 0, borderTopWidth: 0},
    tableCell: {margin: 6, fontSize: 9},
    tableHeaderRow: {backgroundColor: '#f0f0f0'},
    tableHeaderCell: {margin: 6, fontSize: 9, fontWeight: 'bold'}
});

const getCode = (product: DeliveryBoxProduct) => product.p_code || product.code || '';

const getSkuCode = (product: DeliveryBoxProduct) => product.sku_code || product.product_sku || '';

const getDescription = (product: DeliveryBoxProduct) => product.description || product.p_title || product.product_name || '';

export const Table: React.FC<{products: DeliveryBoxProduct[]}> = function ({products}) {
    const columns = [
        {label: 'Code', flex: 1.2},
        {label: 'sku_code', flex: 1.3},
        {label: 'description', flex: 4},
        {label: 'quantity', flex: 1.2}
    ];

    return (
        <View style={styles.table}>
            {/* Header row */}
            <View style={[styles.tableRow, styles.tableHeaderRow]} wrap={false} fixed>
                {columns.map((column) => (
                    <View key={column.label} style={[styles.tableCol, {flex: column.flex}]}>
                        <Text style={styles.tableHeaderCell}>{column.label}</Text>
                    </View>
                ))}
            </View>

            {/* Data rows */}
            {products.map((product, rowIndex) => (
                <View key={`${getCode(product)}-${rowIndex}`} style={styles.tableRow} wrap={false}>
                    <View style={[styles.tableCol, {flex: columns[0].flex}]}>
                        <Text style={styles.tableCell}>{getCode(product)}</Text>
                    </View>
                    <View style={[styles.tableCol, {flex: columns[1].flex}]}>
                        <Text style={styles.tableCell}>{getSkuCode(product)}</Text>
                    </View>
                    <View style={[styles.tableCol, {flex: columns[2].flex}]}>
                        <Text style={styles.tableCell}>{getDescription(product)}</Text>
                    </View>
                    <View style={[styles.tableCol, {flex: columns[3].flex}]}>
                        <Text style={styles.tableCell}>{product.quantity}</Text>
                    </View>
                </View>
            ))}
        </View>
    );
};
