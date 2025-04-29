export default function Page() {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-50 text-gray-900">
            <div className="max-w-2xl w-full">
                <h1 className="text-4xl font-bold mb-4">PDF Generator API</h1>
                <p className="text-lg mb-8">
                    This service generates PDFs dynamically based on your submitted payloads.
                </p>

                <h2 className="text-2xl font-semibold mb-4">Available Endpoints:</h2>

                <div className="mb-6">
                    <p className="bg-gray-200 p-2 rounded-md font-mono text-sm inline-block">POST /gnurun/delivery</p>
                    <p className="text-sm mt-2">Generates a standard PDF from your payload.</p>
                </div>

                <div className="mb-6">
                    <p className="bg-gray-200 p-2 rounded-md font-mono text-sm inline-block">POST /gnurun/delivery-label</p>
                    <p className="text-sm mt-2">Generates a label-style PDF, ideal for shipping and product tags.</p>
                </div>

                <h2 className="text-2xl font-semibold mt-10 mb-4">How to Use:</h2>
                <p className="text-base">
                    Send a valid JSON payload to either of the endpoints.
                    The server will process your data and return a ready-to-download PDF file.
                </p>
            </div>
        </main>
    );
}

