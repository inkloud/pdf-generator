import {StyleSheet} from '@react-pdf/renderer';

export const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica',
    },
    section: {
        marginBottom: 16,
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 24,
    },
    logo: {
        width: 100,
        height: 35,
        marginBottom: 8,
    },
    title: {
        fontSize: 18,
        textAlign: "center",
    },
    infoBox: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
    },
    box: {
        width: "48%",
    },
    label: {
        fontWeight: "bold",
    },
    tableHeader: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#ccc",
        backgroundColor: "#f0f0f0",
        paddingVertical: 4,
    },
    tableRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderColor: "#eee",
        paddingVertical: 4,
    },
    cell: {
        flex: 1,
        paddingHorizontal: 4,
    },
    footer: {
        marginTop: 16,
    },
    totals: {
        marginTop: 8,
    },
    pageNumber: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        textAlign: 'center',
        fontSize: 10,
        color: 'grey'
    },
    topHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    barcodeContainer: {
        alignItems: 'center',
    },
    barcode: {
        width: 100,
        height: 40,
    },
    barcodeId: {
        fontSize: 10,
        marginTop: 4,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderColor: '#ccc',
        paddingTop: 8,
        marginTop: 16,
    },
    summaryTable: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderWidth: 1,
        borderColor: '#ccc',
    },
});