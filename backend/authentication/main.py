# from app import app
from bson import ObjectId

def check_user(user_id, user_collection):
    if not user_id:
        # app.logger.error(f'user_id is not available')
        return {'error': f'user_id is not available'}, 400

    try:
        user_id = ObjectId(user_id)
    except:
        # app.logger.error(f'User ID is not a valid ObjectId: {user_id}')
        return {f'error': f'User ID is not a valid id:{user_id}'}, 400

    user= user_collection.find_one({"_id": user_id})

    if not user:
        # app.logger.error(f'User not found. user_id: {user_id}')
        return {f'error': f'User not found. user_id: {user_id}'}, 403

    return user_id, 200
