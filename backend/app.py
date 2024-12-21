from flask import Flask, request
from flask_cors import CORS
import os
import zipfile
from io import BytesIO
import re
from datetime import datetime
from bson import ObjectId

import json

from pymongo import MongoClient


MONGO_URI = "mongodb://localhost:27017/"

client = MongoClient(MONGO_URI)  
db = client['amazon_data_collector']  
interaction_collection = db['interactions'] 

# db_schema
# [
#     {
#         _id:user_id,
#         user_name:user_name,
#         interactions:[
#             {**interaction},
#             .
#             .
#             .
#         ]
#     },
#     .
#     .
#     .
# ]

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
REMOVE_ZIP_FILE= True
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
localhost:5000

@app.route('/upload', methods=['POST'])
def upload_file():

    if 'file' not in request.files:
        app.logger.info('No file part in the request')
        return {'error': 'No file part'}, 400

    file = request.files['file']
    if file.filename == '':
        app.logger.info('No selected file')
        return {'error': 'No selected file'}, 400
    
    match = re.search(r"USER_(.+?)/SESSION", file.filename)
    user_id = None 
    if match:
        user_id = match.group(1)  
    
    if not user_id: 
        app.logger.error(f'user_id is not available')
        return {'error': f'user_id is not available'}, 400 

    user= interaction_collection.find_one({"_id": ObjectId(user_id)})

    if not user:
        app.logger.error(f'User not found. user_id:{user_id}')
        return {f'error': f'User not found. user_id:{user_id}'}, 403
   
    if file:
        filepath = ""
        if file.filename.endswith('.zip'):
            try:
                file_bytes = file.read()

                with zipfile.ZipFile(BytesIO(file_bytes), 'r') as zip_ref:
                    filepath = os.path.join(UPLOAD_FOLDER, file.filename.replace('.zip', ''))
                    os.makedirs(filepath, exist_ok=True)
                    
                    zip_ref.extractall(filepath)
                    app.logger.info(f'File {file.filename} decompressed successfully')

            except zipfile.BadZipFile:
                app.logger.error(f'Error: {file.filename} is not a valid zip file')
                return {'error': 'Invalid zip file'}, 400    
        else:
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)

            file.save(filepath)
            app.logger.info(f'File {file.filename} uploaded successfully')

        with open(os.path.join(filepath,'interactions.json'), 'r') as json_file:
            interaction_file = json.load(json_file)

        interaction_collection.update_one(
            { "_id": ObjectId(user_id) }, 
            {
                "$push": {
                    "interactions": {
                        "$each": interaction_file["interactions"]
                    }
                }
            }
        )
        

        return {'message': f'File {file.filename} uploaded successfully'}, 200



if __name__ == '__main__':
    app.run(debug=True, port=5000)
