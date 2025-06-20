from django.shortcuts import render

# Create your views here.
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status

from .models import Product, StockHistory, Supplier, Transaction
from .serializers import ProductSerializer, StockHistorySerializer, SupplierSerializer, TransactionSerializer
from rest_framework.permissions import IsAuthenticated

from .permissions import IsAdminUser
from rest_framework.pagination import PageNumberPagination

import csv
from django.http import HttpResponse


# ----- SUPPLIER VIEWS -----
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def supplier_list(request):
    if request.method == 'GET':
        suppliers = Supplier.objects.all()
        serializer = SupplierSerializer(suppliers, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = SupplierSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def supplier_detail(request, pk):
    try:
        supplier = Supplier.objects.get(pk=pk)
    except Supplier.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = SupplierSerializer(supplier)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = SupplierSerializer(supplier, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        # Check if supplier is linked to any active products
        if Product.objects.filter(supplier=supplier, is_active=True).exists():
            return Response(
                {"error": "Cannot delete supplier with active products."},
                status=status.HTTP_400_BAD_REQUEST
            )
        supplier.delete()
        return Response({"message": "Supplier deleted successfully."}, status=204)

# ----- PRODUCT VIEWS -----

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def product_list(request):
    if request.method == 'GET':
        products = Product.objects.filter(is_active=True)

        # Search filters
        name = request.GET.get('name')
        min_price = request.GET.get('min_price')
        max_price = request.GET.get('max_price')
        supplier_id = request.GET.get('supplier')

        if name:
            products = products.filter(name__icontains=name)
        if min_price:
            products = products.filter(price__gte=min_price)
        if max_price:
            products = products.filter(price__lte=max_price)
        if supplier_id:
            products = products.filter(supplier__id=supplier_id)

        # Pagination
        paginator = PageNumberPagination()
        paginator.page_size = 10
        result_page = paginator.paginate_queryset(products, request)
        serializer = ProductSerializer(result_page, many=True)
        return paginator.get_paginated_response(serializer.data)

    elif request.method == 'POST':
        serializer = ProductSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

   
@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)

    if request.method == 'GET':
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == 'DELETE':
        product.is_active = False
        product.save()
        return Response({"message": "Product archived (soft deleted)"}, status=204)
        # return Response(status=status.HTTP_204_NO_CONTENT)

# ----- TRANSACTION VIEWS -----
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def transaction_list(request):
    if request.method == 'GET':
        transactions = Transaction.objects.select_related('product').all()
        serializer = TransactionSerializer(transactions, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        serializer = TransactionSerializer(data=request.data)
        if serializer.is_valid():
            transaction = serializer.save()
            product = transaction.product
            if transaction.transaction_type == 'ADD':
                product.quantity += transaction.quantity
            elif transaction.transaction_type == 'REMOVE':
                if transaction.quantity > product.quantity:
                    return Response(
                        {"error": "Insufficient stock"},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                product.quantity -= transaction.quantity
            product.save()
            return Response(TransactionSerializer(transaction).data, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def low_stock_products(request):
    threshold = int(request.GET.get('threshold', 10))  # default = 10
    low_stock_items = Product.objects.filter(quantity__lt=threshold)
    serializer = ProductSerializer(low_stock_items, many=True)
    return Response(serializer.data)



@api_view(['DELETE'])
@permission_classes([IsAuthenticated, IsAdminUser])
def product_delete(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        product.delete()
        return Response(status=204)
    except Product.DoesNotExist:
        return Response(status=404)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def stock_history(request, product_id):
    history = StockHistory.objects.filter(product_id=product_id).order_by('-changed_at')
    serializer = StockHistorySerializer(history, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def export_products_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = 'attachment; filename="products.csv"'

    writer = csv.writer(response)
    writer.writerow(['ID', 'Name', 'SKU', 'Quantity', 'Price', 'Supplier', 'Last Updated'])

    products = Product.objects.select_related('supplier').all()
    for product in products:
        writer.writerow([
            product.id,
            product.name,
            product.sku,
            product.quantity,
            product.price,
            product.supplier.name if product.supplier else '',
            product.last_updated.strftime('%Y-%m-%d %H:%M:%S')
        ])

    return response

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def archived_products(request):
    archived = Product.objects.filter(is_active=False)
    serializer = ProductSerializer(archived, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def restore_product(request, pk):
    try:
        product = Product.objects.get(pk=pk, is_active=False)
        product.is_active = True
        product.save()
        return Response({"message": "Product restored."})
    except Product.DoesNotExist:
        return Response({"error": "Product not found or already active"}, status=404)
