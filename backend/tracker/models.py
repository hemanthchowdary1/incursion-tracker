from django.db import models
from django.contrib.auth.models import User

class Universe(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name

class Saga(models.Model):
    name = models.CharField(max_length=100)
    universe = models.ForeignKey(Universe, on_delete=models.CASCADE, related_name='sagas')
    order = models.IntegerField(default=0) 

    def __str__(self):
        return self.name

class Title(models.Model):
    TITLE_TYPES = [
        ('MOVIE', 'Movie'),
        ('SHOW', 'TV Show'),
        ('SPECIAL', 'Special Presentation')
    ]
    
    IMPORTANCE_LEVELS = [
        ('ESSENTIAL', 'Essential for Doomsday'),
        ('IMPORTANT', 'Important Context'),
        ('OPTIONAL', 'Optional / Nice to know'),
        ('COMPLETIONIST', 'Completionist Only')
    ]

    title = models.CharField(max_length=255)
    title_type = models.CharField(max_length=20, choices=TITLE_TYPES, default='MOVIE')
    release_date = models.DateField(null=True, blank=True)
    runtime_minutes = models.IntegerField(null=True, blank=True)
    synopsis = models.TextField(blank=True, null=True)
    poster_url = models.URLField(max_length=500, blank=True, null=True)
    
    universe = models.ForeignKey(Universe, on_delete=models.SET_NULL, null=True, related_name='titles')
    saga = models.ForeignKey(Saga, on_delete=models.SET_NULL, null=True, blank=True, related_name='titles')
    phase = models.IntegerField(null=True, blank=True)
    
    release_order = models.IntegerField(null=True, blank=True)
    chronological_order = models.IntegerField(null=True, blank=True)

    importance = models.CharField(max_length=20, choices=IMPORTANCE_LEVELS, default='OPTIONAL')
    why_watch_this = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.title

class UserWatchProgress(models.Model):
    STATUS_CHOICES = [
        ('WATCHED', 'Watched 🟢'),
        ('WATCHING', 'Watching 🟡'),
        ('NOT_WATCHED', 'Not Watched ⚪'),
        ('REWATCH', 'Rewatch Recommended 🔴')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='watch_progress')
    title = models.ForeignKey(Title, on_delete=models.CASCADE, related_name='user_progress')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='NOT_WATCHED')
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'title')

    def __str__(self):
        return f"{self.user.username} - {self.title.title} ({self.status})"

class UserProgress(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='progress')
    
    watched_ids = models.JSONField(default=list) 

    def __str__(self):
        return f"{self.user.username}'s Timeline Progress"

class MarvelNews(models.Model):
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title
    
    class Meta:
        ordering = ['-created_at']