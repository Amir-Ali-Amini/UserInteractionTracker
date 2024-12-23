from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import zipfile
from io import BytesIO
from datetime import datetime, timedelta, timezone
from bson import ObjectId
import json
from botocore.exceptions import NoCredentialsError

import config
from db import user_collection, interaction_collection, s3_client
from authentication import check_user
from utils import get_interactions_by_date

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER= config.UPLOAD_FOLDER

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)
localhost:5000






@app.route('/upload', methods=['POST'])
def upload_file():

    if 'file' not in request.files:
        app.logger.info('No file part in the request')
        return jsonify({'error': 'No file part'}), 400

    file = request.files['file']
    if file.filename == '':
        app.logger.info('No selected file')
        return jsonify({'error': 'No selected file'}), 400

    user_id = request.form.get('user_id')

    result, status = check_user(user_id, user_collection=user_collection)
    if status!=200:
        return jsonify(result), status
    else: user_id = result


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
                return jsonify({'error': 'Invalid zip file'}), 400
        else:
            filepath = os.path.join(UPLOAD_FOLDER, file.filename)
            os.makedirs(os.path.dirname(filepath), exist_ok=True)

            file.save(filepath)
            app.logger.info(f'File {file.filename} uploaded successfully')

        return jsonify({'message': f'File {file.filename} uploaded successfully'}), 200



@app.route('/interactions', methods=['POST'])
def interactions():
    data = None
    json_data = request.form.get('interactions')

    if not json_data:
        return jsonify({'error': 'Interactions not found'}), 400

    try:
        data = json.loads(json_data)
    except json.JSONDecodeError:
        return jsonify({'error': 'Invalid JSON data'}), 400


    user_id = request.form.get('user_id')

    result, status = check_user(user_id, user_collection=user_collection)
    if status!=200:
        return result, status
    else: user_id = result


    if data:
        updated_interactions = [
            {**interaction, "user_id": ObjectId(user_id)}
            for interaction in data["interactions"]
            ]

        interaction_collection.insert_many(updated_interactions)

        return jsonify({'message': f'Interactions added successfully'}), 200

    return jsonify({'error': f'Unknown error'}), 400


@app.route('/generate_presigned_post', methods=['GET'])
def generate_presigned_post():

    user_id = request.args.get('user_id')

    result, status = check_user(user_id, user_collection=user_collection)

    if status!=200:
        return result, status
    else: user_id = result

    expiration = config.EXPIRATION_TIME
    expire_timestamp = int((datetime.now(timezone.utc) + timedelta(seconds=expiration//2)).timestamp()) # to make sure at least half of the time remains

    prefix = f'user_interaction_data/USER_{user_id}'

    try:
        # Generate a presigned POST URL
        response = s3_client.generate_presigned_post(
                    Bucket=config.BUCKET_NAME,
                    Key=f'{prefix}/${{filename}}',
                    ExpiresIn=expiration,
                    Conditions=[
                        ["content-length-range", 0*(1024*1024), 100*(1024*1024)], #100MB
                        ["starts-with", "$key", prefix],
                    ]
                )

        response['expire_timestamp'] = expire_timestamp
        return jsonify(response)

    except NoCredentialsError:
        return jsonify({'error': 'Credentials not available'}), 403

@app.route('/get_interactions', methods=['GET'])
def get_interactions():
    user_id = request.args.get('user_id')
    date_str = request.args.get('date')  # in 'YYYY-MM-DD' format
    return_data = request.args.get('return')

    result, status = check_user(user_id, user_collection=user_collection)

    if status!=200:
        return result, status
    else: user_id = result

    if date_str:
        try:
            date = datetime.strptime(date_str, '%Y-%m-%d')
        except ValueError:
            return jsonify({"error": "Invalid date format, should be YYYY-MM-DD"}), 400
    else:
        date = None

    interactions = get_interactions_by_date(user_id, date, return_data)

    return jsonify(interactions)


if __name__ == '__main__':
    app.run(debug=True, port=5000)
