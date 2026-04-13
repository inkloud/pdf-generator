import {Order} from "../types/fulfillment";
import fs from "fs";
import path from 'path';
import {createCanvas} from "canvas";
import JsBarcode from "jsbarcode";

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
    const imagePath = path.resolve(process.cwd(), 'app/static/media/image/gnurun-hd.png');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64 = imageBuffer.toString('base64');
    return `data:image/png;base64,${base64}`;
}

export function getBarcode(value: string) {
    const canvas = createCanvas(300, 80);
    JsBarcode(canvas, value, {
        format: "CODE39",
        displayValue: false,
        margin: 0,
        height: 60,
    });
    return canvas.toDataURL("image/png");
}