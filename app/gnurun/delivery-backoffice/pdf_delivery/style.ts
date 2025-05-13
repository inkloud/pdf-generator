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
    headerContainer: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24},
    addressBox: {width: '60%'},
    rightBox: {width: '40%', textAlign: 'right'}
});