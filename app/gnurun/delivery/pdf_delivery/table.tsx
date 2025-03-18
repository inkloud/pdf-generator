import {StyleSheet, Text, View} from '@react-pdf/renderer';
import React from 'react';

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

export const Table: React.FC<{columns: string[]; rows: {[k: string]: string}[]}> = function ({columns, rows}) {
    const width = `${100 / columns.length}%`;

    const header = columns.map((c, index) => (
        <View key={index} style={[styles.tableCol, {width}]}>
            <Text style={styles.tableHeaderCell}>{c}</Text>
        </View>
    ));
    const pdfRows = rows.map((r, index) => {
        const cols = columns.map((c, index) => (
            <View key={index} style={[styles.tableCol, {width}]}>
                <Text style={styles.tableCell}>{r[c]}</Text>
            </View>
        ));
        return (
            <View key={index} style={styles.tableRow} wrap={false}>
                {cols}
            </View>
        );
    });
    return (
        <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeaderRow]} wrap={false}>
                {header}
            </View>
            {pdfRows}
        </View>
    );
};
