import random
import string

# Create a random string of the given length
def generate_random_string(length):
    characters = string.ascii_letters + string.digits  # Letters (lowercase and uppercase) and digits
    random_string = ''.join(random.choice(characters) for _ in range(length))
    return random_string