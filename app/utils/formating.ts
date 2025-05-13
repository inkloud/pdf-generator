import {Order} from "../types/fulfillment";

export function formatAddress(addressObj: Order["address"]) {
    const { address, street, city, province, zip_code, country } = addressObj;

    const parts = [
        address,
        street,
        city,
        province,
        zip_code,
        country
    ].filter(part => part && part.trim() !== '');

    return parts.join(', ');
}