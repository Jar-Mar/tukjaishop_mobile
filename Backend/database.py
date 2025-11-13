from pymongo import MongoClient
from dotenv import load_dotenv
import os
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URL = os.getenv("MONGO_URL", "mongodb://192.168.1.118:27017")
DB_NAME = os.getenv("DB_NAME", "TUKJAISHOP")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# 🧰 Helper แปลง ObjectId ให้ส่งกลับ JSON ได้
def serialize_doc(doc):
    """แปลง _id เป็น string"""
    if not doc:
        return None
    doc["_id"] = str(doc["_id"])
    return doc

def serialize_list(cursor):
    return [serialize_doc(d) for d in cursor]

