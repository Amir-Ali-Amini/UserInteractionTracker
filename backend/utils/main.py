from datetime import datetime, timedelta
from bson import ObjectId

import config
from db import interaction_collection

def get_interactions_by_date(user_id, date=None, return_data=None ):
    # If no date is specified, use today's date
    if date is None:
        date = datetime.now()

    # Create date range for the specified date

    start_of_day = date.strftime("%Y-%m-%dT00:00:00.000Z")
    end_of_day = (date + timedelta(days=1)).strftime("%Y-%m-%dT00:00:00.000Z")

    if return_data:
        interactions = interaction_collection.find({
            "user_id": ObjectId(user_id),
            "timestamp": {
                "$gte": start_of_day,
                "$lt": end_of_day
            }
        })
        interactions = list(interactions)
        for interaction in interactions:
            interaction["_id"] = str(interaction["_id"])
            if "user_id" in interaction:
                interaction["user_id"] = str(interaction["user_id"])
        return list(interactions)
    else:
        n_documents= interaction_collection.count_documents({
            "user_id": ObjectId(user_id),
            "timestamp": {
                "$gte": start_of_day,
                "$lt": end_of_day
            }
        })
        return{
            "start_of_day":start_of_day,
            "end_of_day":end_of_day,
            "number_of_documents" : n_documents
        }
