import {renderToStream} from '@react-pdf/renderer';
import {NextResponse} from 'next/server';

import {FulfillmentPDF} from './pdf_fulfillment';
import {Order} from "../../types/fulfillment";

export async function GET() {
    return NextResponse.json({
            "id": 1674,
            "created_at": "2025-04-01T10:19:34",
            "customer": {
                "customer_id": 1,
                "company_id": 1,
                "company_name": "Life365 Italy TEST"
            },
            "customer_id": 1,
            "warehouse": "Gnu000 Test",
            "address": {
                "business_name": "",
                "reference_name": "Javid Test Test",
                "address": "via nomentana 1111",
                "city": "Roma",
                "street": "",
                "province": "Roma",
                "country": "Italy",
                "zip_code": "00137",
                "email": "",
                "tel": ""
            },
            "status": "CONFIRMED",
            "extra_data": {
                "courier_data": {
                    "courier_name": "Mario",
                    "courier_tracking": ""
                },
                "customer_reference": "Javid Test Test",
                "reference_name": "",
                "provider": "GNURUN console"
            },
            "cost": {
                "shipping_cost": "0.00",
                "inner_cost": []
            },
            "note": "",
            "warehouse_note": null,
            "products": [
                {
                    "product_id": 3,
                    "product_sku": "HW415NN",
                    "product_name": "Pannelli da 415",
                    "product_position": "CC.00.00.04",
                    "height": 3,
                    "width": 114,
                    "length": 175,
                    "weight": 21,
                    "note": "",
                    "stock": 1
                },
                {
                    "product_id": 3,
                    "product_sku": "HW415NN",
                    "product_name": "Pannelli da 415",
                    "product_position": "CC.00.00.04",
                    "height": 3,
                    "width": 114,
                    "length": 175,
                    "weight": 21,
                    "note": "",
                    "stock": 1
                },
                {
                    "product_id": 3,
                    "product_sku": "HW415NN",
                    "product_name": "Pannelli da 415",
                    "product_position": "CC.00.00.04",
                    "height": 3,
                    "width": 114,
                    "length": 175,
                    "weight": 21,
                    "note": "",
                    "stock": 1
                }
            ],
            "files": [],
            "invoice_n": null,
            "billing_cycle": null
        }
    );
}

export async function POST(req: Request) {
    const jsonData = await req.json();

    if (!jsonData) {
        return new Response('Missing JSON data', { status: 400 });
    }

    const order = Order.create(jsonData);

    try {
        const nodeStream = await renderToStream(
            <FulfillmentPDF
                order={order}
            />
        );
        const webStream = new ReadableStream({
            start(controller) {
                nodeStream.on('data', (chunk) => controller.enqueue(chunk));
                nodeStream.on('end', () => controller.close());
                nodeStream.on('error', (err) => controller.error(err));
            }
        });

        return new Response(webStream, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'inline; filename="delivery.pdf"',
                'Access-Control-Allow-Origin': '*', // Javid change the source here, for the prod
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}
