import mysql.connector
from mysql.connector.pooling import MySQLConnectionPool
import config


db=MySQLConnectionPool(
    host='localhost',
    user=config.user, 
    password=config.password, 
    database='show_record_system',
    pool_name='connection_pool',
    pool_size=15,
    pool_reset_session=True
)
def connect_db(db):
    conn=db.get_connection()
    cursor=conn.cursor()
    return conn,cursor

def close_db(conn,cursor):
    cursor.close()
    conn.close()

# check dbs
def db_exist(db,cursor,dbname):
    cursor.execute('show databases')
    dbs=[]
    for db in cursor.fetchall():
        dbs.append(db[0])
    return dbname in dbs #boolen

    

def create_table(cursor,table_name):
    if table_name=='companys':
        cursor.execute(f'''
        create table {table_name}(
            company varchar(255) character set utf8mb4 primary key,
            logo_link varchar(255)
        )''')

    if table_name=='accounts':
        cursor.execute(f'''
        create table {table_name}(
            id bigint primary key auto_increment,
            company varchar(255) character set utf8mb4 not null,
            name varchar(255) character set utf8mb4 not null,
            email varchar(255) character set utf8mb4 not null,
            password varchar(255) character set utf8mb4 not null,
            authority varchar(255) character set utf8mb4 not null,
            time datetime default current_timestamp,
            foreign key(company) references companys(company) on delete cascade
        )''')
    if table_name=='shows':
        cursor.execute(f'''
        create table {table_name}(
            show_name varchar(255) character set utf8mb4 primary key,
            region varchar(255) character set utf8mb4 not null,
            start date not null,
            end date not null
        )''')

if __name__=='__main__':
    db = mysql.connector.connect(
        host="localhost",
        user=config.user,
        password=config.password
    )
    cursor=db.cursor()
    db_name='show_record_system'

    # database
    if not db_exist(db,cursor,db_name):
        cursor.execute(f'create database {db_name}')
    db.database=db_name
    # db.database='taipeispot'


    # table
    table_name=['companys','accounts','shows']

    cursor.execute('show tables')
    exist_tables=cursor.fetchall()
    print(exist_tables)
    tables=[]
    if exist_tables!=[]:
        for table in exist_tables:
            tables.append(table[0])
        for table in table_name:
            if table not in tables:
                create_table(cursor,table)
    else:
        for table in table_name:
            create_table(cursor,table)