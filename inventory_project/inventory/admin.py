from django.contrib import admin
from .models import Supplier, Product, Transaction

# Register your models here.

admin.site.register(Supplier)
admin.site.register(Product)
admin.site.register(Transaction)