import {renderToStream} from '@react-pdf/renderer';
import {NextResponse} from 'next/server';

import {JSX} from 'react';
import {GroupedProduct, MainOrder, Order} from '../../types/fulfillment';
import {groupOrdersByProductPickingGroupFirst} from '../../utils/sorting';
import {GroupedProductPDFBackoffice} from './pdf_fulfillment/backoffice';

type PdfRenderer = (orders: GroupedProduct[], sourceOrders: Order[]) => JSX.Element;

const PdfStyle: Record<string, PdfRenderer> = {
    GROUPED: (orders, sourceOrders) => (
        <GroupedProductPDFBackoffice
            orders={orders}
            sourceOrders={sourceOrders}
            includeGroupSummary
        />
    ),
    SEPARATE: (orders, sourceOrders) => (
        <GroupedProductPDFBackoffice
            orders={orders}
            sourceOrders={sourceOrders}
            includeGroupSummary={false}
        />
    ),
    // Keep the previous name working for existing integrations.
    BACKOFFICE: (orders, sourceOrders) => (
        <GroupedProductPDFBackoffice
            orders={orders}
            sourceOrders={sourceOrders}
            includeGroupSummary
        />
    ),
};

export async function GET() {
    return NextResponse.json([
        {
            id: 1674,
            created_at: '2025-04-01T10:19:34',
            customer: {
                customer_id: 1,
                company_id: 1,
                company_name: 'Life365 Italy TEST'
            },
            customer_id: 1,
            current_wh: 1,
            address: {
                business_name: '',
                reference_name: 'Javid Test Test',
                address: 'via nomentana 1111',
                city: 'Roma',
                street: '',
                province: 'Roma',
                country: 'Italy',
                zip_code: '00137',
                email: '',
                tel: ''
            },
            status: 'CONFIRMED',
            extra_data: {
                courier_data: {
                    courier_name: '',
                    courier_tracking: ''
                },
                customer_reference: 'Javid Test Test',
                reference_name: '',
                provider: 'GNURUN console'
            },
            cost: {
                shipping_cost: '0.00',
                inner_cost: []
            },
            note: '',
            warehouse_note: null,
            products: [
                {
                    product_id: 3,
                    product_sku: 'HW415NN',
                    product_name: 'Pannelli da 415',
                    product_position: 'CC.00.00.04',
                    height: 3,
                    width: 114,
                    length: 175,
                    weight: 21,
                    note: '',
                    stock: 1
                }
            ],
            files: [],
            invoice_n: null,
            billing_cycle: null
        }
    ]);
}

export async function POST(req: Request) {
    const jsonData = await req.json();

    if (!jsonData) {
        return new Response('Missing JSON data', {status: 400});
    }

    const style = ((new URL(req.url)).searchParams.get('style') || 'GROUPED').toUpperCase();
    const renderPdf = PdfStyle[style];

    if (!renderPdf) {
        return NextResponse.json(
            {error: `Unsupported style '${style}'. Use GROUPED or SEPARATE.`},
            {status: 400}
        );
    }

    const rawOrders = jsonData.map((order: unknown) => Order.create(order as Partial<MainOrder>));
    const grouped: GroupedProduct[] = groupOrdersByProductPickingGroupFirst(rawOrders);
    const pdfNode = renderPdf(grouped, rawOrders);

    try {
        const nodeStream = await renderToStream(pdfNode);
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
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            }
        });
    } catch (error) {
        console.error(error);
        return NextResponse.error();
    }
}
