from rest_framework import serializers
from .models import Title, Universe, Saga

class TitleSerializer(serializers.ModelSerializer):
    universe_name = serializers.CharField(source='universe.name', read_only=True)
    saga_name = serializers.CharField(source='saga.name', read_only=True)

    class Meta:
        model = Title
        fields = [
            'id', 'title', 'title_type', 'release_date', 'runtime_minutes', 
            'synopsis', 'poster_url', 'universe_name', 'saga_name', 
            'phase', 'importance', 'why_watch_this'
        ]