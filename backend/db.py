from pymongo import MongoClient
import boto3

import config

client = MongoClient(config.MONGO_URI)

db = client[config.DATABASE_NAME]
interaction_collection = db[config.INTERACTION_COLLECTION_NAME]
user_collection = db[config.USER_COLLECTION_NAME]
UPLOAD_FOLDER = config.UPLOAD_FOLDER

AWS_ACCESS_KEY = config.AWS_ACCESS_KEY
AWS_SECRET_KEY = config.AWS_SECRET_KEY
BUCKET_NAME = config.BUCKET_NAME

s3_client = boto3.client('s3',
        aws_access_key_id=AWS_ACCESS_KEY,
        aws_secret_access_key=AWS_SECRET_KEY)


# db_schema
#       interactions:
#             [
#                 {
#                     interactions:[
#                         {_id:objectID, **interaction, user_id:ObjectID},
#                         .
#                         .
#                         .
#                     ]
#                 },
#                 .
#                 .
#                 .
#             ]
#       users:
#             [
#                 {
#                     _id:ObjectID,
#                     user_name:string,
#                 },
#                 .
#                 .
#                 .
#             ]
