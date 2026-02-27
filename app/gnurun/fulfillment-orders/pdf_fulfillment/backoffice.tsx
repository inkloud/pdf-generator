import React from "react";

import { Document, Image, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "./style";
import {getBarcode, getLogo} from "@/app/utils/formating";
import {GroupedProduct, PositionAgg, Product, ProductOrderEntry} from "@/app/types/fulfillment";
import {buildQtyLines, QtyLine} from "@/app/utils/sorting";


/**
 * Aggregates quantities by position (e.g. CC.00.00.04) while preserving first-seen order.
 */
const uniquePositionsFromEntries = (entries: ProductOrderEntry[]) => {
    const seen = new Set<string>();
    const out: { position: string; qty: number }[] = [];

    for (const e of entries) {
        const pos = (e.position || "").trim() || "-";
        if (!seen.has(pos)) {
            seen.add(pos);
            out.push({ position: pos, qty: 0 }); // qty not used for your Qty column anymore
        }
    }
    return out;
};

const calcGroupQty = (g: GroupedProduct) => {
    const ordersCount = g.orders.length;
    const stockPerOrder = g.orders[0]?.quantity ?? 0;
    return { ordersCount, stockPerOrder, totalQty: ordersCount * stockPerOrder };
};

const totalsForProduct = (product: Product, totalQty: number) => {
    const unitVol = (product.length ?? 0) * (product.width ?? 0) * (product.height ?? 0);

    return {
        weight: (product.weight ?? 0) * totalQty, // kg if weight is kg
        volume: unitVol * totalQty,               // cm³
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

const Barcode = function({picking_group}: {picking_group: number | null | undefined}) {
    console.log(picking_group);
    if(!picking_group) return null;
    return(
        <View style={styles.barcodeContainer}>
            <Text style={styles.barcodeText}>{getBarcode(picking_group.toString())}</Text>
            <Text style={styles.barcodeId}>{picking_group}</Text>
        </View>
    )
}

export const GroupedProductPDFBackoffice: React.FC<{ orders: GroupedProduct[] }> = ({ orders }) => {
    const rows = orders.map((g) => {
        const positions = uniquePositionsFromEntries(g.orders);
        const { ordersCount, stockPerOrder, totalQty } = calcGroupQty(g);
        return { product: g.product, positions, ordersCount, stockPerOrder, totalQty, picking_group: g.orders[0].picking_group };
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
                        <Barcode picking_group={rows[0].picking_group} />
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
                                {r.positions.map((p, i) => (
                                    <Text key={`pos-${i}`}>{p.position}</Text>
                                ))}
                            </View>

                            <View style={[styles.cell, { flex: 1.2 }]}>
                                {r.positions.map((_, i) => (
                                    <Text key={`qty-${i}`}>{i === 0 ? `${r.ordersCount} x ${r.stockPerOrder}` : ""}</Text>
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