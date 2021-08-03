from dotenv import load_dotenv
import os

load_dotenv()

#rds
# host=os.environ.get('RDS_host')
# user=os.environ.get('RDS_user')
user=os.environ.get('user')
# password=os.environ.get('RDS_password')
password=os.environ.get('password')


#s3
bucket_name=os.environ.get('BUCKET_NAME')
cdn_domain=os.environ.get('cdn_domain')
AWSSecretKey=os.environ.get('AWSSecretKey')
AWSAccessKeyId=os.environ.get('AWSAccessKeyId')