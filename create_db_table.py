from mysql.connector.pooling import MySQLConnectionPool
import config



def connect_db(db):
    conn=db.get_connection()
    cursor=conn.cursor()
    return conn,cursor

def close_db(conn,cursor):
    cursor.close()
    conn.close()


    

def create_table(cursor,table_name):
    if table_name=='companys':
        cursor.execute(f'''
        create table {table_name}(
            id bigint primary key auto_increment,
            company varchar(255) character set utf8mb4 not null,
            logo_link varchar(255)
        )''')

    if table_name=='accounts':
        cursor.execute(f'''
        create table {table_name}(
            id bigint primary key auto_increment,
            company_id bigint not null,
            name varchar(255) character set utf8mb4 not null,
            email varchar(255) character set utf8mb4 not null,
            password varchar(255) character set utf8mb4 not null,
            authority varchar(255) character set utf8mb4 not null,
            time datetime default current_timestamp,
            foreign key(company_id) references companys(id) on delete cascade
        )''')
    if table_name=='shows':
        cursor.execute(f'''
        create table {table_name}(
            id bigint primary key auto_increment,
            company_id bigint not null,
            show_name varchar(255) character set utf8mb4 not null,
            region varchar(255) character set utf8mb4 not null,
            start date not null,
            end date not null,
            foreign key(company_id) references companys(id) on delete cascade
        )''')
    
    if table_name=='products':
        cursor.execute(f'''
        create table {table_name}(
            id bigint primary key auto_increment,
            item_number varchar(255) character set utf8mb4 not null,
            company_id bigint not null,
            price bigint,
            img_link varchar(255),
            foreign key(company_id) references companys(id) on delete cascade
        )''')
    
    if table_name=='orders':
        cursor.execute(f'''
        create table {table_name}(
            id bigint primary key auto_increment,
            company_id bigint not null,
            submitter_id bigint not null,
            show_id bigint not null,
            customer varchar(255) character set utf8mb4 not null,
            products json not null,
            quantities json not null,
            total bigint,
            phone varchar(25),
            email varchar(255),
            address varchar(255) character set utf8mb4,
            tax_id varchar(25) character set utf8mb4,
            comment text character set utf8mb4,
            foreign key(company_id) references companys(id) on delete cascade,
            foreign key(show_id) references shows(id) on delete cascade
        )''')

db=MySQLConnectionPool(
    host='localhost',
    user=config.user, 
    password=config.password, 
    database='show_record_system',
    pool_size=1,
    pool_reset_session=True
)

if __name__=='__main__':

    conn,cursor=connect_db(db)
    db_name='show_record_system'

    


    # table
    table_name=['companys','accounts','shows','products','orders']

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