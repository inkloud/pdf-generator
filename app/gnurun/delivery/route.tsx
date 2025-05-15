import {renderToStream} from '@react-pdf/renderer';
import {NextResponse} from 'next/server';

import {DeliveryPDF} from './pdf_delivery';
import {Delivery} from "../../types/delivery";

export async function GET() {
    return NextResponse.json({
        message: 'Only POST is possible on this URI',
        payload: {
            delivery: {
                id: 428,
                creation_date: '2025-01-16T08:12:40.000Z',
                boxes: [
                    {
                        id: 453,
                        box_height_cm: '10',
                        box_length_cm: '0',
                        box_width_cm: '0',
                        box_qty: 0,
                        products: [{quantity: 60, p_code: 'TEST'}]
                    }
                ]
            },
            company_name: 'Life365 Italy',
            courier_name: 'BRT',
            courier_tracking: '123456789'
        }
    });
}

export async function POST(req: Request) {
    const formData = await req.formData();
    const jsonData = formData.get('json') as string;

    if (!jsonData) {
        return new Response('Missing JSON data', { status: 400 });
    }

    const delivery = Delivery.create(JSON.parse(jsonData));


    try {
        const nodeStream = await renderToStream(
            <DeliveryPDF
                delivery={delivery}
                company_name={delivery.company_name}
                courier_name={delivery.courier_name}
                courier_tracking={delivery.courier_tracking}
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
                'Content-Disposition': 'inline; filename="delivery.pdf"'
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}