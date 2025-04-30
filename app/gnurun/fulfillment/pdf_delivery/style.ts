import {StyleSheet} from '@react-pdf/renderer';

export const styles = StyleSheet.create({
    page: {padding: 64},
    footer: {
        position: 'absolute',
        fontSize: 10,
        bottom: 16,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: 'grey'
    },
    headerTitle: {textAlign: 'center', marginBottom: 24},
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 24
    },
    headerValueContainer: {
        display: 'flex',
        flexDirection: 'row',
        textAlign: 'left',
        alignItems: 'flex-start',
        marginBottom: 6
    },
    headerValueText: {
        textAlign: 'left',
        marginLeft: 10
    },
    headerValueTitle: {
        fontWeight: 'bold',
    },
    addressBox: {width: '40%', textAlign: 'left'},
    rightBox: {width: '40%', textAlign: 'left'}
});
