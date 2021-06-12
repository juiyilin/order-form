from dotenv import load_dotenv
import os

load_dotenv()

#db
user=os.environ.get('DB_USER')
password=os.environ.get('DB_PASSWORD')
