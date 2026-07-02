from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    SupplierViewSet,
    ProductViewSet,
    TransactionViewSet,
    StockHistoryViewSet
)

router = DefaultRouter()
router.register(r'suppliers', SupplierViewSet, basename="supplier")
router.register(r'products', ProductViewSet, basename="products")
router.register(r'transactions', TransactionViewSet, basename= "transaction")

urlpatterns = [
    path('', include(router.urls)),
    path('stock-history/<int:product_id>/', StockHistoryViewSet.as_view({'get': 'list'})),
]

