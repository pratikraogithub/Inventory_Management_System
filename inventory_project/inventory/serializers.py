from rest_framework import serializers
from .models import Product, StockHistory, Supplier, Transaction

class SupplierSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = '__all__'

class ProductSerializer(serializers.ModelSerializer):
    supplier = SupplierSerializer(read_only=True)
    sku = serializers.CharField(required=False)  # Make SKU optional
    supplier_id = serializers.PrimaryKeyRelatedField(
        queryset=Supplier.objects.all(), source='supplier', write_only=True
    )

    class Meta:
        model = Product
        fields = ['id', 'name', 'sku', 'quantity', 'price', 'last_updated', 'supplier', 'supplier_id']
        read_only_fields = ['last_updated']

class TransactionSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(
        queryset=Product.objects.all(), source='product', write_only=True
    )

    class Meta:
        model = Transaction
        fields = ['id', 'product', 'product_id', 'transaction_type', 'quantity', 'timestamp', 'notes']

class StockHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = StockHistory
        fields = ['id', 'product', 'old_quantity', 'new_quantity', 'changed_at']
