import React from "react";

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./style";
import { getLogo } from "@/app/utils/formating";
import { GroupedProduct, Product, ProductOrderEntry } from "@/app/types/fulfillment";
import {buildQtyLines, QtyLine} from "@/app/utils/sorting";

type PositionAgg = { position: string; qty: number };

/**
 * Aggregates quantities by position (e.g. CC.00.00.04) while preserving first-seen order.
 */
const aggregateByPosition = (orders: ProductOrderEntry[]): PositionAgg[] => {
    const map = new Map<string, number>();
    for (const o of orders) {
        const pos = (o.position || "").trim() || "-";
        map.set(pos, (map.get(pos) ?? 0) + (o.quantity ?? 0));
    }
    return Array.from(map.entries()).map(([position, qty]) => ({ position, qty }));
};

const totalsForProduct = (product: Product, totalQty: number) => {
    const unitVol = (product.length ?? 0) * (product.width ?? 0) * (product.height ?? 0);
    return {
        weight: (product.weight ?? 0) * totalQty,
        volume: unitVol * totalQty,
        quantity: totalQty,
    };
};

const totalsForAll = (rows: Array<{ product: Product; totalQty: number }>) => {
    return rows.reduce(
        (acc, r) => {
            const t = totalsForProduct(r.product, r.totalQty);
            acc.weight += t.weight;
            acc.volume += t.volume;
            acc.quantity += t.quantity;
            return acc;
        },
        { weight: 0, volume: 0, quantity: 0 }
    );
};

export const GroupedProductPDFBackoffice: React.FC<{ orders: GroupedProduct[] }> = ({ orders }) => {
    const rows = orders.map((g) => {
        const positions = aggregateByPosition(g.orders);
        const totalQty = positions.reduce((s, p) => s + p.qty, 0);
        return { product: g.product, positions, totalQty };
    });

    const grand = totalsForAll(rows.map((r) => ({ product: r.product, totalQty: r.totalQty })));

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View>
                    <Text style={styles.title}>Picking List</Text>
                    <View style={styles.topHeaderRow}>
                        <Image style={styles.logo} src={getLogo()}/>
                    </View>
                </View>

                {/* Main Table */}
                <View style={styles.tableHeader}>
                    <Text style={[styles.cell, { flex: 0.5 }]}>No.</Text>
                    <Text style={[styles.cell, { flex: 1 }]}>Code</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>Product</Text>
                    <Text style={[styles.cell, { flex: 2 }]}>Position</Text>
                    <Text style={[styles.cell, { flex: 1.2 }]}>Qty</Text>
                    <Text style={[styles.cell, { flex: 0.8 }]}>Total</Text>
                </View>

                <View style={styles.borderedView}>
                    {rows.map((r, idx) => (
                        <View key={r.product.product_id ?? idx} style={styles.tableRow}>
                            <Text style={[styles.cell, { flex: 0.5 }]}>{idx + 1}</Text>
                            <Text style={[styles.cell, { flex: 1 }]}>{r.product.product_sku}</Text>
                            <Text style={[styles.cell, { flex: 2 }]}>{r.product.product_name}</Text>


                            <View style={[styles.cell, { flex: 2 }]}>
                                {buildQtyLines(r.positions).map((l, i) => (
                                    <Text key={`pos-${i}`}>{l.position}</Text>
                                ))}
                            </View>

                            <View style={[styles.cell, { flex: 1.2 }]}>
                                {buildQtyLines(r.positions).map((l, i) => (
                                    <Text key={`qty-${i}`}>{l.qtyText}</Text>
                                ))}
                            </View>

                            <Text style={[styles.cell, { flex: 0.8 }]}>{r.totalQty}</Text>
                        </View>
                    ))}
                </View>

                {/* Footer Totals */}
                <View style={styles.summaryTable}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.cell, { flex: 1 }]}>Total weight</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>Volume</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>Total qty</Text>
                    </View>
                    <View style={styles.tableRow}>
                        <Text style={[styles.cell, { flex: 1 }]}>{grand.weight} kg</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>{grand.volume} cm³</Text>
                        <Text style={[styles.cell, { flex: 1 }]}>{grand.quantity}</Text>
                    </View>
                </View>

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