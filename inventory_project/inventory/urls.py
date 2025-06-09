from django.urls import path
from . import views

urlpatterns = [
    path('suppliers/', views.supplier_list),
    path('suppliers/<int:pk>/', views.supplier_detail),
    path('products/', views.product_list),
    path('products/<int:pk>/', views.product_detail),
    path('transactions/', views.transaction_list),
    path('products/low-stock/', views.low_stock_products),
    path('products/<int:product_id>/history/', views.stock_history, name='stock-history'),
    path('products/export/csv/', views.export_products_csv, name='export-products-csv'),
    path('archived-products/', views.archived_products, name='archived-products'),
    path('products/<int:pk>/restore/', views.restore_product, name='restore-product'),


    
]
