from .utils import response

def home(request):
    return response(True, "Welcome to the DeepSight API!", {}, 200)

def health(request):
    return response(True, "API is healthy!", {}, 200)