import {Document, Page, Text, View} from '@react-pdf/renderer';

import {styles} from './style';
import {Table} from './table';
import {Box as BoxType, Delivery} from './type';

const Header: React.FC<{
    id: number;
    date: Date;
    company_name: string;
    courier_name: string;
    courier_tracking: string;
}> = function ({id, date, company_name, courier_name, courier_tracking}) {
    return (
        <View style={styles.headerContainer}>
            <View style={styles.addressBox}>
                <Text>{company_name}</Text>
                <Text>{courier_name}</Text>
                <Text>{courier_tracking}</Text>
            </View>
            <View style={styles.rightBox}>
                <Text>Shipping #{id}</Text>
                <Text>Date: {date.toLocaleDateString()}</Text>
            </View>
        </View>
    );
};

const Footer = function () {
    return (
        <Text
            style={styles.footer}
            fixed
            render={({pageNumber, totalPages}) => `Page ${pageNumber} of ${totalPages}`}
        />
    );
};

const BoxTitle: React.FC<{box: BoxType; idx_box: number; total_boxes: number}> = function ({
                                                                                               box,
                                                                                               idx_box,
                                                                                               total_boxes
                                                                                           }) {
    const isDummyBox = box.box_qty === 0;
    const box_index = box.box_qty === 1 ? `${idx_box + 1}` : `${idx_box + 1}..${idx_box + box.box_qty}`;
    return (isDummyBox && 'Dummy Box') || `Box ${box_index}/${total_boxes}`;
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
                <View style={{width: '50%'}}>
                    <Table columns={columns} rows={rows} />
                </View>
                <View style={{width: '50%'}}>
                    <Table columns={[' ']} rows={rows.map(() => ({' ': ' '}))} />
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
    let current_index = 0;
    const boxes = delivery.boxes!.map((box) => {
        const res = <Box key={box.id} data={box} total_boxes={total_boxes} idx_box={current_index} />;
        current_index += box.box_qty;
        return res;
    });

    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Header
                    id={delivery.id}
                    date={delivery.creation_date}
                    company_name={company_name}
                    courier_name={courier_name}
                    courier_tracking={courier_tracking}
                />
                {boxes}
                <Footer />
            </Page>
        </Document>
    );
};