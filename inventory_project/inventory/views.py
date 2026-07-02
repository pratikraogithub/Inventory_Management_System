
from rest_framework.viewsets import ModelViewSet, ReadOnlyModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import Supplier, Product, Transaction, StockHistory
from .serializers import SupplierSerializer, ProductSerializer, TransactionSerializer, StockHistorySerializer

from rest_framework.pagination import PageNumberPagination
from django.http import HttpResponse
import csv
from rest_framework.decorators import action


class SupplierViewSet(ModelViewSet):
    queryset = Supplier.objects.all()
    serializer_class = SupplierSerializer
    permission_classes = [IsAuthenticated]

    def destroy(self, request, *args, **kwargs):
        supplier = self.get_object()

        if Product.objects.filter(supplier=supplier, is_active=True).exists():
            return Response(
                {"error": "Cannot delete supplier with active products."},
                status=status.HTTP_400_BAD_REQUEST
            )

        supplier.delete()
        return Response(
            {"message": "Supplier deleted successfully."},
            status=status.HTTP_204_NO_CONTENT
        )

class ProductPagination(PageNumberPagination):
    page_size = 10


class ProductViewSet(ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = ProductPagination

    def get_queryset(self):
        queryset = Product.objects.all()

        # Query params
        name = self.request.query_params.get('name')
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        supplier = self.request.query_params.get('supplier')
        is_active = self.request.query_params.get('is_active', 'true')

        if is_active == 'true':
            queryset = queryset.filter(is_active=True)

        if name:
            queryset = queryset.filter(name__icontains=name)
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        if supplier:
            queryset = queryset.filter(supplier_id=supplier)

        return queryset

    def destroy(self, request, *args, **kwargs):
        """Soft delete"""
        product = self.get_object()
        product.is_active = False
        product.save()
        return Response(
            {"message": "Product archived (soft deleted)"},
            status=status.HTTP_204_NO_CONTENT
        )

    @action(detail=False, methods=['get'], )
    def archived(self, request):
        archived_products = Product.objects.filter(is_active=False)
        serializer = self.get_serializer(archived_products, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'], url_path='restore')
    def restore(self, request, pk=None):
        product = Product.objects.filter(pk=pk, is_active= False).first()
        if not product:
            return Response({"detail": "Archived product not found."}, status=404)
            
        product.is_active = True
        product.save()
        return Response({"message": "Product restored."})

    @action(detail=False, methods=['get'])
    def low_stock(self, request):
        threshold = int(request.query_params.get('threshold', 10))
        products = Product.objects.filter(quantity__lt=threshold)
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def export_csv(self, request):
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
    

class TransactionViewSet(ModelViewSet):
    queryset = Transaction.objects.select_related('product').all()
    serializer_class = TransactionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        transaction = serializer.save()
        product = transaction.product

        if transaction.transaction_type == 'ADD':
            product.quantity += transaction.quantity
        elif transaction.transaction_type == 'REMOVE':
            if transaction.quantity > product.quantity:
                raise ValueError("Insufficient stock")
            product.quantity -= transaction.quantity

        product.save()

class StockHistoryViewSet(ReadOnlyModelViewSet):
    serializer_class = StockHistorySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        product_id = self.kwargs.get('product_id')
        return StockHistory.objects.filter(product_id=product_id).order_by('-changed_at')