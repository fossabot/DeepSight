from django.http import JsonResponse

def response(success, message, data, status = 200):
    return JsonResponse({
        "success": success,
        "message": message,
        "data": data
    }, status = status)