import {renderToStream} from '@react-pdf/renderer';
import {NextResponse} from 'next/server';

import {DeliveryPDF} from './pdf_delivery';

export async function GET() {
    return NextResponse.json({
        message: 'Only POST is possible on this URI',
        payload: {
            id: 4,
            customer_id: 1,
            boxes: [
                {products: [{code: 'HW415NN', qty: 36}]},
                {products: [{code: 'HW415NN', qty: 36}]},
                {products: [{code: 'HW415NN', qty: 36}]},
                {
                    products: [
                        {code: 'HP301', qty: 20},
                        {code: 'HP302', qty: 30}
                    ]
                }
            ]
        }
    });
}

export async function POST(req: Request) {
    const {id, customer_id, boxes} = await req.json();

    try {
        const nodeStream = await renderToStream(<DeliveryPDF id={id} customer_id={customer_id} boxes={boxes} />);
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
                'Content-Disposition': 'inline; filename="delivery-label.pdf"'
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}
