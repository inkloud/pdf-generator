import React from "react";

import {Document, Page, Text, View} from '@react-pdf/renderer';
import {styles} from './style';
import {Table} from './table';
import {Order} from "../../../types/fulfillment";

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
                        <Text style={styles.headerValueText}>{order.warehouse}</Text>
                    </div>
                    <div style={styles.headerValueContainer}>
                        <Text style={styles.headerValueTitle}>FBA: </Text>
                        <Text style={styles.headerValueText}>{order.address.country + "," + order.address.province + "," + order.address.city + "," + order.address.address + "," + order.address.zip_code}</Text>
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

const Footer = function () {
    return (
        <Text
            style={styles.footer}
            fixed
            render={({pageNumber, totalPages}) => `Page ${pageNumber} of ${totalPages}`}
        />
    );
};

const BoxTitle: React.FC<{}> = function ({}) {
    return <Text>Products</Text>;
};

export const DeliveryPDF: React.FC<{order: Order;}> = function ({order}) {
    return (
        <Document>
            <Page size="A4" orientation="landscape" style={styles.page}>
                <Header order={order}/>
                <Text style={{fontSize: 20, margin: 12}}>
                    <BoxTitle/>
                </Text>
                <Table products={order.products} />
                <Footer />
            </Page>
        </Document>
    );
};
