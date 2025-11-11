import {Document, Page, Text, View} from '@react-pdf/renderer';

import React from 'react';
import {DeliveryBox as BoxType, Delivery, DeliveryBox, DeliveryBoxProduct} from '../../../types/delivery';
import {styles} from './style';
import {Table} from './table';

const checkTotals = function (delivery: Delivery) {
    function getVolume(product: DeliveryBoxProduct) {
        return product.p_height_cm * product.p_width_cm * product.p_length_cm * product.quantity;
    }

    const totals = {weight: 0, quantity: 0, volume: 0};
    if (delivery.boxes.length > 0) {
        delivery.boxes.forEach((box: DeliveryBox) => {
            box.products.forEach((product) => {
                totals.volume += getVolume(product);
                totals.quantity += product.quantity;
                totals.weight += product.p_weight_kg;
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
            <Text style={styles.headerTitle}>Picking List</Text>
            <View style={styles.headerContainer}>
                <View style={styles.addressBox}></View>
                <View style={styles.rightBox}>
                    <Text>Shipping id: {delivery.id}</Text>
                </View>
            </View>
            <View style={styles.headerContainer}>
                <View style={styles.addressBox}>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Sender: </Text>
                        <Text style={styles.headerValueText}>{delivery.company_name}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Warehouse: </Text>
                        <Text style={styles.headerValueText}>{delivery.warehouse_id}</Text>
                    </div>
                </View>
                <View style={styles.rightBox}>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Date: </Text>
                        <Text style={styles.headerValueText}>{delivery.creation_date}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Doc. number: </Text>
                        <Text style={styles.headerValueText}>{delivery.id}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Courier name: </Text>
                        <Text style={styles.headerValueText}>{delivery.courier_name}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Customer reference: </Text>
                        <Text style={styles.headerValueText}>{delivery.customer_id}</Text>
                    </div>
                </View>
            </View>
            {/*    <View style={styles.headerContainer}>*/}
            {/*    <View style={styles.addressBox}>*/}
            {/*        <Text>{delivery.company_name}</Text>*/}
            {/*        <Text>{delivery.courier_name}</Text>*/}
            {/*        <Text>{delivery.courier_tracking}</Text>*/}
            {/*    </View>*/}
            {/*    <View style={styles.rightBox}>*/}
            {/*        <Text>Shipping #{delivery.id}</Text>*/}
            {/*        <Text>Date: {(new Date(delivery.creation_date).toLocaleDateString())}</Text>*/}
            {/*    </View>*/}
            {/*</View>*/}
        </>
    );
};

const Footer: React.FC<{delivery: Delivery}> = function ({delivery}) {
    const totals = checkTotals(delivery);
    return (
        <>
            <Text style={styles.totals} fixed>
                Total weight: {totals.weight} kg; Total net volume: {totals.volume} cm3; Total quantity{' '}
                {totals.quantity};
            </Text>
            <Text
                style={styles.footer}
                fixed
                render={({pageNumber, totalPages}) => `Page ${pageNumber} of ${totalPages}`}
            />
        </>
    );
};

const BoxTitle: React.FC<{
    box: BoxType;
    idx_box: number;
    total_boxes: number;
}> = function ({box, idx_box, total_boxes}) {
    const box_index = box.box_qty === 1 ? `${idx_box + 1}` : `${idx_box + 1}..${idx_box + box.box_qty}`;
    return `Box ${box_index}/${total_boxes}`;
};

const Box: React.FC<{data: BoxType; total_boxes: number; idx_box: number}> = function ({data, total_boxes, idx_box}) {
    const columns = ['Code', 'Quantity'];
    const rows = data.products.map((p) => ({Code: p.p_code, Quantity: `${p.quantity}`}));

    return (
        <>
            <Text style={{fontSize: 20, margin: 12}}>
                <BoxTitle box={data} idx_box={idx_box} total_boxes={total_boxes} />{' '}
                <Text
                    style={{fontSize: 10, margin: 12}}
                >{`${data.box_width_cm.toString()}cm x ${data.box_length_cm.toString()}cm x ${data.box_height_cm.toString()}cm`}</Text>
            </Text>
            <View style={{flexDirection: 'row'}}>
                <View style={{width: '100%'}}>
                    <Table products={data.products} />
                </View>
            </View>
        </>
    );
};

export const DeliveryPDF: React.FC<{
    delivery: Delivery;
    company_name: string;
    courier_name: string;
    courier_tracking: string;
}> = function ({delivery, company_name, courier_name, courier_tracking}) {
    const total_boxes = delivery.boxes.map((b) => b.box_qty).reduce((acc, item) => acc + item, 0);
    const {offsets: boxOffsets} = delivery.boxes.reduce(
        (acc, box) => {
            acc.offsets.push(acc.runningIndex);
            acc.runningIndex += box.box_qty;
            return acc;
        },
        {offsets: [] as number[], runningIndex: 0}
    );
    const boxes = delivery.boxes.map((box, idx) => (
        <Box key={box.id} data={box} total_boxes={total_boxes} idx_box={boxOffsets[idx]} />
    ));

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Header delivery={delivery} />
                {boxes}
                <Footer delivery={delivery} />
            </Page>
        </Document>
    );
};
