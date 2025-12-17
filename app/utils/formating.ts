import fs from 'fs';
import path from 'path';

import {Order} from '../types/fulfillment';

export function formatAddress(addressObj: Order['address']) {
    const {business_name, address, street, city, province, zip_code, country} = addressObj;

    const parts = [business_name, address, street, city, province, zip_code, country].filter((part) => {
        if (typeof part === 'string') return part.trim() !== '';
        return part !== undefined && part !== null;
    });

    return parts.join(', ');
}

export const formatDate = (iso: string) => iso.split('T')[0];

export function getLogo() {
    const imagePath = path.resolve(process.cwd(), 'app/static/media/image/gnurun-hd.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
}

export function getBarcode(value: string) {
    // Aggiungi asterischi per il formato Code 39 (richiesto dal font)
    const barcodeValue = `*${value}*`;
    return barcodeValue;
}
