from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.
def home (request):
    data = "hello world";
    return JsonResponse({"content":data})