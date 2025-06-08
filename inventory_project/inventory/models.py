from django.db import models
import random
import string

# Create your models here.

class Supplier(models.Model):
    name = models.CharField(max_length=100)
    contact_email = models.EmailField()
    phone = models.CharField(max_length=20)
    address = models.TextField()

    def __str__(self):
        return self.name


class Product(models.Model):
    name = models.CharField(max_length=100)
    sku = models.CharField(max_length=30, unique=True, blank=True)
    quantity = models.PositiveIntegerField(default=0)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    supplier = models.ForeignKey('Supplier', on_delete=models.SET_NULL, null=True, blank=True)
    last_updated = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

    def generate_sku(self):
        base = ''.join(e for e in self.name if e.isalnum()).upper()[:5]
        rand = ''.join(random.choices(string.digits, k=4))
        return f"{base}{rand}"

    def save(self, *args, **kwargs):
        is_update = self.pk is not None

        if not self.sku:
            sku_candidate = self.generate_sku()
            while Product.objects.filter(sku=sku_candidate).exists():
                sku_candidate = self.generate_sku()
            self.sku = sku_candidate

        if is_update:
            old = Product.objects.get(pk=self.pk)
            if old.quantity != self.quantity:
                from .models import StockHistory  # import here to avoid circular import
                StockHistory.objects.create(
                    product=self,
                    old_quantity=old.quantity,
                    new_quantity=self.quantity
                )

        super().save(*args, **kwargs)


class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('ADD', 'Stock In'),
        ('REMOVE', 'Stock Out'),
    )

    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    transaction_type = models.CharField(max_length=6, choices=TRANSACTION_TYPES)
    quantity = models.PositiveIntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.transaction_type} - {self.product.name} - {self.quantity}"

class StockHistory(models.Model):
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='stock_logs')
    old_quantity = models.PositiveIntegerField()
    new_quantity = models.PositiveIntegerField()
    changed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.product.name} | {self.old_quantity} → {self.new_quantity}"
