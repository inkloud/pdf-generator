import {StyleSheet} from '@react-pdf/renderer';

export const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 11,
        fontFamily: 'Helvetica'
    },
    section: {
        marginBottom: 16
    },
    titleContainer: {
        alignItems: 'center',
        marginBottom: 24
    },
    logo: {
        width: 100,
        height: 35,
        marginBottom: 8
    },
    logoRow: {
        width: '100%',
        alignItems: 'flex-start'
    },
    title: {
        fontSize: 18,
        textAlign: 'center'
    },
    infoBox: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8
    },
    box: {
        width: '48%'
    },
    rightBox: {
        textAlign: 'right'
    },
    label: {
        fontWeight: 'bold'
    },
    footer: {
        position: 'absolute',
        fontSize: 10,
        bottom: 16,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey'
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        backgroundColor: '#f0f0f0',
        paddingVertical: 4
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#eee',
        paddingVertical: 4
    },
    cell: {
        flex: 1,
        paddingHorizontal: 4
    },
    summaryTable: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderWidth: 1,
        borderColor: '#ccc'
    },
});
