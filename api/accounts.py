from flask import Blueprint,request,session,jsonify,abort
from create_db_table import db,connect_db,close_db
import hashlib
import re

accounts = Blueprint( 'accounts', __name__ )



@accounts.route('/status',methods=['GET','PATCH','DELETE'])
def status():
    
    if request.method=='GET':
        print('get 取得session')
        print(session)
        if 'user' not in session:
            session['user']=None  
        return jsonify(dict(session)),200

    if request.method=='PATCH':
        print('patch 更新session')
        # check mysql
        company=request.json['company']
        email=request.json['email']
        if valid_email(email)==None:
            abort(400,'密碼格式錯誤')
        password=to_hash(request.json['password'])
        conn,cursor=connect_db(db)
        print(*[company,email,password])
        try:
            cursor.execute('select id,company, name, email, authority from accounts where company = %s and email = %s and password = %s',(company,email,password))
        except:
            abort(500,'伺服器發生錯誤')
        else:
            get_first=cursor.fetchone()
            close_db(conn,cursor)
            if get_first==None:
                abort(400,'登入失敗，公司名稱或帳號或密碼錯誤或無此帳號密碼')
            print(get_first)
            user={
                'id':get_first[0],
                'company':get_first[1],
                'name':get_first[2],
                'email':get_first[3],
                'auth':get_first[4]
            }
       
        session['user']=user
        print(session)
        return jsonify(dict(session)),200

    if request.method=='DELETE':
        session.pop('user')
        return jsonify({'result':'success'}),200

    

    

@accounts.route('/content', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def content():
    if request.method=='GET':
        company=session['user']['company']
        name=request.args.get('name')
        print('name',name)
        if name!=session['user']['name'] and session['user']['auth']=='一般':
            abort(403,'沒有權限')
        conn,cursor=connect_db(db) 

        if name!=None:
            print('get 取得一筆帳號資料')
           
            cursor.execute('select name, email, authority from accounts where company=%s and name = %s',(company,name))
            get_one=cursor.fetchone()
            if get_one==None:
                abort(400,'無此資料')
            close_db(conn,cursor)
            print(get_one)
            return jsonify(get_one),200
        else:
            if session['user']['auth']=='高':
                print('get 取得所有帳號資料')
                cursor.execute('select name, email, authority from accounts where company = %s order by time',(company,))
                get_all=cursor.fetchall()
                close_db(conn,cursor)

                return jsonify(get_all),200
            else:
                abort(403,'沒有權限')

    if request.method=='POST':
        name=request.json['name']
        # check email
        email=request.json['email']
        if valid_email(email)==None:
            abort(400,'密碼格式錯誤')
        # hash password
        password=to_hash(request.json['password'])
        conn,cursor=connect_db(db)

        if 'company' in request.json:
            print('post 第一次註冊帳號')
            print(request.json)
            company=request.json['company']
            authority='高'
            
            # check company is exist
            try: 
                cursor.execute('select * from companys where company = %s',(company,))
            except:
                abort(500,'伺服器錯誤')
            else:
                get_company=cursor.fetchone()
                if get_company == None:
                    try:
                        # insert company
                        cursor.execute('insert into companys (company) values(%s)',(company,))
                    except:
                        abort(500,'新增公司時發生不明錯誤')
                    
                    else:
                        insert_account(cursor,conn,company,name,email,password,authority)

                        # 新增完更新session
                        session['user']={
                            'company':company,
                            'name':name,
                            'email':email,
                            'auth':authority
                        }
                else:
                    abort(400,'新增失敗，公司名稱 已被使用')
        else:
            print('post 新增其他使用者帳號')
            print(request.json)
            company=session['user']['company']
            authority=request.json['authority']

            # check name, email is exist in company
            cursor.execute('select name, email from accounts where company=%s and (name=%s or email=%s)',(company,name,email))
            get_one=cursor.fetchone()
            if get_one==None:
                insert_account(cursor,conn,company,name,email,password,authority)
            else:
                abort(400,'新增失敗，名稱或信箱 已被使用')

        return jsonify({'result':'success'}),200

    if request.method=='PATCH':
        print('PATCH 更新帳號資料')
        print(request.json)
        print(session['user'])
        old_name=request.json['oldName']
        old_email=request.json['oldEmail']
        if valid_email(old_email)==None:
            abort(400,'密碼格式錯誤')
        company=session['user']['company']
        old_password=to_hash(request.json['oldPassword'])
        conn,cursor=connect_db(db)
        
        # check old password is correct
        try:
            cursor.execute('''
            select * from accounts where name = %s and email = %s and company = %s and password = %s
            ''',(old_name,old_email,company,old_password))
        except:
            abort(500)
        else:
            get_account=cursor.fetchone()
            print(get_account)
            new_name=request.json['newName']
            new_email=request.json['newEail']
            if valid_email(new_email)==None:
                abort(400,'信箱格式錯誤')
            new_password=to_hash(request.json['newPassword'])
            
            if get_account != None:
                # if true, old password is correct
                if old_name!=new_name or old_email!=new_email:
                    #若old_name!=new_name 或 old_email!=new_email，檢查此公司new_name與new_email是否已被使用
                    cursor.execute('select * from accounts where company=%s and (name=%s or email=%s)',(company,new_name,new_email))
                    get_one=cursor.fetchone()
                    print(get_one)
                    if get_one==None:
                        try:
                            cursor.execute('''
                            update accounts set name=%s, email=%s, password=%s 
                            where company=%s and name=%s and email=%s and password=%s
                            ''',(new_name,new_email,new_password,company,old_name,old_email,old_password))
                        except:
                            abort(500,'修改帳號時發生不明錯誤')
                        conn.commit()
                        close_db(conn,cursor)
                        
                        if session['user']['name']==old_name:
                            company=session['user']['company']
                            auth=session['user']['auth']
                            session.pop('user')
                            user={
                                'company':company,
                                'name':new_name,
                                'email':new_email,
                                'auth':auth
                            }
                            session['user']=user
                            print('new',session)
                    else:
                        abort(400,'修改失敗， 名稱或Email 已被使用')
                
                else:
                    #新舊name,email皆相同
                    try:
                        cursor.execute('''
                        update accounts set name=%s, email=%s, password=%s 
                        where company=%s and name=%s and email=%s and password=%s
                        ''',(new_name,new_email,new_password,company,old_name,old_email,old_password))
                    except:
                        abort(500,'修改帳號時發生不明錯誤')
                    conn.commit()
                    close_db(conn,cursor)
            else:
                abort(400,'原密碼輸入錯誤')
        return jsonify({'result':'success'}),200


    if request.method=='DELETE':
        print('delete 刪除帳號')
        print(request.json)
        name=request.json['name']
        email=request.json['email']
        conn,cursor=connect_db(db)
        try:
            cursor.execute('delete from accounts where name = %s and email = %s',(name,email))
        except:
            abort(500,'刪除帳號時發生不明錯誤')
        else:
            conn.commit()
            close_db(conn,cursor)
            if name==session['user']['name'] and email==session['user']['email']:
                session.pop('user')
            return jsonify({'result':'success'}),200
 

def valid_email(email):
    pattern=r'^\w+@\w+\.+\w+\.*\w*\.*\w*'
    result=re.match(pattern,email)
    return result

def to_hash(password):
    hash_type = hashlib.sha256()
    password=password.encode(encoding='UTF-8')
    hash_type.update(password)
    p = hash_type.hexdigest()
    return p

# def connect_db(db):
#     conn=db.get_connection()
#     cursor=conn.cursor()
#     return conn,cursor

# def close_db(conn,cursor):
#     cursor.close()
#     conn.close()

def insert_account(cursor,conn,company,name,email,password,authority):
    try:
        # insert account
        cursor.execute('''
        insert into accounts (company, name, email, password, authority) values(%s,%s,%s,%s,%s)
        ''',(company,name,email,password,authority))
    except:
        abort(500,'新增帳號時發生不明錯誤')
    conn.commit()
    close_db(conn,cursor)