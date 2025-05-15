import React from "react";

import {Document, Page, Text, View} from '@react-pdf/renderer';
import {styles} from './style';
import {Table} from './table';
import {formatAddress} from "../../../utils/formating";
import {Order, Product} from "../../../types/fulfillment";

const checkTotals = function(order: Order){

    function getVolume(product: Product){
        return (product.height * product.width * product.length)*product.stock;
    }

    let totals = {weight: 0, quantity: 0, volume: 0};
    if (order.products.length > 0){
        order.products.forEach(product => {
            totals.volume+=getVolume(product)
            totals.quantity+=product.stock
            totals.weight+=product.weight
        })
        return totals
    }else {
        return totals;
    }
}

const Header: React.FC<{order: Order;}> = function ({order}) {

    return (
        <>
            <Text style={styles.headerTitle}>Picking List</Text>
            <View style={styles.headerContainer}>
                <View style={styles.addressBox}>

                </View>
                <View style={styles.rightBox}>
                    <Text>Fulfillment order id: {order.id}</Text>
                </View>
            </View>
            <View style={styles.headerContainer}>
                <View style={styles.addressBox}>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Sender: </Text>
                        <Text style={styles.headerValueText}>{order.customer.company_name}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Warehouse: </Text>
                        <Text style={styles.headerValueText}>{order.current_wh}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>FBA: </Text>
                        <Text style={styles.headerValueText}>{formatAddress(order.address)}</Text>
                    </div>
                </View>
                <View style={styles.rightBox}>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Date: </Text>
                        <Text style={styles.headerValueText}>{order.created_at}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Doc. number: </Text>
                        <Text style={styles.headerValueText}>{order.id}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Courier name: </Text>
                        <Text
                            style={styles.headerValueText}>{order.extra_data.courier_data.courier_name}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>Customer reference: </Text>
                        <Text
                            style={styles.headerValueText}>{order.extra_data.customer_reference}</Text>
                    </div>
                </View>
            </View>
        </>

    );
};

const Footer: React.FC<{order: Order}> = function ({order}) {
    let totals = checkTotals(order)
    return (
        <>
            <Text style={styles.totals} fixed>
                Total weight: {totals.weight} kg; Total net volume: {totals.volume} cm3; Total quantity {totals.quantity};
            </Text>
            <Text
                style={styles.footer}
                fixed
                render={({pageNumber, totalPages}) => `Page ${pageNumber} of ${totalPages}`}
            />
        </>
    );
};

const BoxTitle: React.FC<{}> = function ({}) {
    return <Text>Products</Text>;
};

export const FulfillmentPDF: React.FC<{order: Order;}> = function ({order}) {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Header order={order}/>
                <Text style={{fontSize: 20, margin: 12}}>
                    <BoxTitle/>
                </Text>
                <Table products={order.products} />
                <Footer order={order}/>
            </Page>
        </Document>
    );
};
