// src/components/ProductList.jsx
import { useEffect, useState } from 'react';
import api from '../utils/api';

export default function ProductList({ onEdit }) {
    const [products, setProducts] = useState([]);

    const fetchProducts = async () => {
        try {
            const res = await api.get('products/');
            console.log(res.data);
            setProducts(res.data.results);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        }
    };

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`products/${id}/`);
                fetchProducts(); // Refresh product list
                alert('✅ Product deleted successfully');
            } catch (err) {
                console.error(err);
                alert('Failed to delete product');
            }
        }
    };

    const downloadCSV = () => {
        if (!products.length) {
            alert('No products to export.');
            return;
        }

        // Headers for CSV file
        const headers = ['ID', 'Name', 'SKU', 'Quantity', 'Price', 'Supplier'];

        // Map product data to rows
        const rows = products.map(p => [
            p.id,
            p.name,
            p.sku,
            p.quantity,
            p.price,
            p.supplier?.name || '',
        ]);

        // Create CSV content string
        const csvContent =
            'data:text/csv;charset=utf-8,' +
            [headers, ...rows].map(e => e.join(',')).join('\n');

        // Create a download link and trigger it
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', 'product_list.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="mt-4">
            <h4>Products</h4>

            <button className="btn btn-secondary mb-3" onClick={downloadCSV}>
                Download CSV
            </button>

            <table className="table table-bordered mt-2">
                <thead className="table-dark">
                    <tr>
                        <th>Name</th>
                        <th>SKU</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Supplier</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {Array.isArray(products) && products.map((p) => (
                        <tr key={p.id}>
                            <td>{p.name}</td>
                            <td>{p.sku}</td>
                            <td>{p.quantity}</td>
                            <td>{p.price}</td>
                            <td>{p.supplier?.name}</td>
                            <td>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => onEdit(p)}>Edit</button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(p.id)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
