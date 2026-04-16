import {Order} from "../types/fulfillment";
import fs from "fs";
import path from 'path';

export function formatAddress(addressObj: Order["address"]) {
    const { address, street, city, province, zip_code, country } = addressObj;

    const parts = [
        address,
        street,
        city,
        province,
        zip_code,
        country
    ].filter(part => {
        if (typeof part === 'string') return part.trim() !== '';
        return part !== undefined && part !== null;
    });

    return parts.join(', ');
}

export const formatDate = (iso: string) => iso.split('T')[0];

export function getLogo(){
    const candidatePaths = [
        path.resolve(process.cwd(), 'app/static/media/image/gnurun-hd.png'),
        path.resolve(process.cwd(), 'static/media/image/gnurun-hd.png'),
    ];

    const imagePath = candidatePaths.find((candidate) => fs.existsSync(candidate));

    if (!imagePath) {
        throw new Error(`Logo not found. Checked: ${candidatePaths.join(', ')}`);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
}

export function getBarcode(value: string) {
    // Aggiungi asterischi per il formato Code 39 (richiesto dal font)
    const barcodeValue = `*${value}*`;
    return barcodeValue;
}
