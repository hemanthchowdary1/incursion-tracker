from django.contrib import admin
from .models import Universe, Saga, Title, UserWatchProgress, MarvelNews

admin.site.register(Universe)
admin.site.register(Saga)
admin.site.register(Title)
admin.site.register(UserWatchProgress)
admin.site.register(MarvelNews)