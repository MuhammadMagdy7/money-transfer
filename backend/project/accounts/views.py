# accounts/views.py
from rest_framework.decorators import action
from rest_framework.response import Response
import csv
import uuid
from django.db import transaction
from .models import Account
from .serializers import AccountSerializer, TransferSerializer
from .pagination import CustomPagination
from django_filters import rest_framework as filters
from rest_framework import viewsets,status, filters as drf_filters


class AccountFilter(filters.FilterSet):
    min_balance = filters.NumberFilter(field_name="balance", lookup_expr='gte')
    max_balance = filters.NumberFilter(field_name="balance", lookup_expr='lte')

    class Meta:
        model = Account
        fields = ['min_balance', 'max_balance']


class AccountViewSet(viewsets.ModelViewSet):
    queryset = Account.objects.all()
    serializer_class = AccountSerializer
    pagination_class = CustomPagination
    filter_backends = [
        filters.DjangoFilterBackend,
        drf_filters.SearchFilter,  # Add search backend
        drf_filters.OrderingFilter  # Add ordering backend
    ]
    filterset_class = AccountFilter
    search_fields = ['name', 'id']  # Fields to search across
    ordering_fields = ['name', 'balance', 'id']

    def list(self, request, *args, **kwargs):
        # Use the built-in filtering from DRF instead of custom logic
        return super().list(request, *args, **kwargs)

        # queryset = self.get_queryset()

        # Search and sorting
        search = request.query_params.get('search', '')
        if search:
            queryset = queryset.filter(name__icontains=search)

        ordering = request.query_params.get('ordering', '-id')
        queryset = queryset.order_by(ordering)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['POST'])
    def import_csv(self, request):
        try:
            csv_file = request.FILES['file']
            decoded_file = csv_file.read().decode('utf-8').splitlines()
            reader = csv.DictReader(decoded_file)

            accounts_created = []
            for row in reader:
                account = Account.objects.create(
                    id=uuid.UUID(row['ID']),  # Convert String to UUID
                    name=row['Name'],
                    balance=row['Balance']
                )
                accounts_created.append(account)

            return Response({
                'message': f'Successfully imported {len(accounts_created)} accounts',
                'accounts': AccountSerializer(accounts_created, many=True).data
            }, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': f'Invalid UUID format: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['POST'])
    def transfer(self, request):
        serializer = TransferSerializer(data=request.data)
        if serializer.is_valid():
            try:
                with transaction.atomic():
                    from_account = Account.objects.get(id=serializer.validated_data['from_account'])
                    to_account = Account.objects.get(id=serializer.validated_data['to_account'])
                    amount = serializer.validated_data['amount']

                    # Check if source and destination accounts are the same
                    if from_account.id == to_account.id:
                        return Response({
                            'error': 'Cannot transfer money to the same account'
                        }, status=status.HTTP_400_BAD_REQUEST)

                    if from_account.balance < amount:
                        raise ValueError('Insufficient funds')

                    from_account.balance -= amount
                    to_account.balance += amount

                    from_account.save()
                    to_account.save()

                return Response({'message': 'Transfer successful'})
            except Account.DoesNotExist:
                return Response({'error': 'Account not found'}, status=status.HTTP_404_NOT_FOUND)
            except ValueError as e:
                return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['DELETE'])
    def delete_all(self, request):
        try:
            # Delete all accounts
            Account.objects.all().delete()
            return Response({'message': 'All accounts have been deleted successfully.'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)