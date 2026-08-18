import os
import requests
import random
import logging
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework.response import Response
from rest_framework.decorators import api_view
from django.core.cache import cache
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from .models import UserProgress, MarvelNews

logger = logging.getLogger(__name__)

@api_view(['POST'])
def request_otp(request):
    email = request.data.get('email', '').strip()
    username = request.data.get('username', '').strip().lower()
    
    # STEP 1: Strict formatting validation
    try:
        validate_email(email)
    except ValidationError:
        return Response({'error': 'Please enter a valid email address.'}, status=400)

    # Check if user already exists
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=400)
        
    # Generate a 6-digit OTP
    otp = str(random.randint(100000, 999999))
    
    # Save OTP in cache for 5 minutes (300 seconds), tied to the email
    cache.set(f"otp_{email}", otp, timeout=300)
    
    # Send the email via Brevo HTTP API
    url = "https://api.brevo.com/v3/smtp/email"
    api_key = os.environ.get('BREVO_API_KEY')
    
    if not api_key:
        logger.error("BREVO_API_KEY is missing from environment variables.")
        return Response({'error': 'Server configuration error'}, status=500)

    payload = {
        "sender": {
            "name": "Hemanth",
            "email": "hemanthchowdary.dev@gmail.com"
        },
        "to": [
            {"email": email}
        ],
        "subject": "Incursion Tracker - Verification Code",
        "htmlContent": f"<html><body><p>Welcome Agent.</p><p>Your timeline verification code is: <strong>{otp}</strong></p><p>This code expires in 5 minutes.</p><br><p><small>(If you did not request this code, you can safely ignore this email.)</small></p></body></html>"
    }

    headers = {
        "accept": "application/json",
        "api-key": api_key,
        "content-type": "application/json"
    }

    try:
        response = requests.post(url, json=payload, headers=headers)
        # Brevo returns 201 on success
        if response.status_code in [200, 201, 202]:
            return Response({'message': 'OTP sent to email'}, status=200)
        else:
            logger.error(f"Brevo API Error: {response.status_code} - {response.text}")
            return Response({'error': 'Failed to send email'}, status=500)
    except Exception as e:
        logger.error(f"Failed to send OTP email to {email}: {e}")
        return Response({'error': 'Failed to send email'}, status=500)


@api_view(['POST'])
def verify_and_register(request):
    email = request.data.get('email', '').strip()
    otp_entered = request.data.get('otp', '').strip()
    username = request.data.get('username', '').strip().lower()
    password = request.data.get('password')

    # Fetch the real OTP from the cache
    saved_otp = cache.get(f"otp_{email}")
    
    if not saved_otp or saved_otp != otp_entered:
        return Response({'error': 'Invalid or expired OTP'}, status=400)
        
    # Re-check availability right before creating
    if User.objects.filter(username=username).exists():
        return Response({'error': 'Username already taken'}, status=400)
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email already registered'}, status=400)

    # Create the user!
    try:
        user = User.objects.create_user(username=username, email=email, password=password)
    except IntegrityError:
        return Response({'error': 'That username or email was just taken. Please try again.'}, status=400)
    
    # Delete the OTP from cache so it can't be reused
    cache.delete(f"otp_{email}")
    
    return Response({'message': 'Account created successfully', 'username': user.username}, status=201)

@api_view(['POST'])
def login_user(request):
    username = request.data.get('username', '').strip().lower()
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        return Response({'message': 'Login successful', 'username': user.username})
    else:
        return Response({'error': 'Invalid credentials'}, status=400)

@api_view(['GET'])
def get_all_titles(request):
    # Placeholder response just to get the server running again
    return Response([
        {"id": 1, "title": "Infinity Saga", "watched": False},
        {"id": 2, "title": "Multiverse Saga", "watched": False}
    ])

@api_view(['GET', 'POST'])
def sync_progress(request):
    username = request.data.get('username') or request.GET.get('username')
    
    if not username:
        return Response({"error": "Username is required"}, status=400)
         
    try:
        user = User.objects.get(username=username)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=404)
         
    progress, created = UserProgress.objects.get_or_create(user=user)
    
    if request.method == 'POST':
        watched_ids = request.data.get('watched_ids', [])
        progress.watched_ids = watched_ids
        progress.save()
        return Response({"message": "Timeline secured.", "watched_ids": progress.watched_ids})
         
    return Response({"watched_ids": progress.watched_ids})

@api_view(['GET'])
def get_marvel_news(request):
    news_items = MarvelNews.objects.filter(is_active=True)[:5]
    data = [{"title": item.title} for item in news_items]
    return Response(data)