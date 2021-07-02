from flask import Blueprint,request,session,jsonify,abort
from create_db_table import db as db
import hashlib

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
        password=to_hash(request.json['password'])
        conn,cursor=connect_db(db)
        print(*[company,email,password])
        try:
            cursor.execute('select company, name, email, authority from accounts where company = %s and email = %s and password = %s',(company,email,password))
        except:
            abort(500,'伺服器發生錯誤')
        else:
            get_first=cursor.fetchone()
            close_db(conn,cursor)
            if get_first==None:
                abort(400,'登入失敗，公司名稱或帳號或密碼錯誤或無此帳號密碼')
            print(get_first)
            user={
                'company':get_first[0],
                'name':get_first[1],
                'email':get_first[2],
                'auth':get_first[3]
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
           
            cursor.execute('select name,email,authority from accounts where company=%s and name = %s',(company,name))
            get_one=cursor.fetchone()
            close_db(conn,cursor)
            print(get_one)
            return jsonify(get_one)
        else:
            print('get 取得所有帳號資料')
            cursor.execute('select name, email, authority from accounts where company = %s order by time',(company,))
            get_all=cursor.fetchall()
            close_db(conn,cursor)

            return jsonify(get_all)

    if request.method=='POST':
        name=request.json['name']
        # check email
        email=request.json['email']
        # hash password
        password=to_hash(request.json['password'])
        conn,cursor=connect_db(db)

        if session['user']==None:
            print('post 第一次註冊帳號')
            print(request.json)
            company=request.json['company']
            
            try: 
                cursor.execute('select * from companys where company = %s ',(company,))
            except:
                abort(500,'伺服器錯誤')
            else:
                # check company is exist
                get_company=cursor.fetchone()
                if get_company == None:
                    try:
                        # insert company
                        cursor.execute('insert into companys (company) values(%s)',(company,))
                    except:
                        abort(500,'新增公司時發生不明錯誤')
                    
                    
                    # check email is exist
                    cursor.execute('select email from accounts where email=%s',(email,))
                    get_one=cursor.fetchone()
                    if get_one==None:
                        try:
                            # insert account
                            cursor.execute('''
                            insert into accounts (company, name, email, password, authority) values(%s,%s,%s,%s,%s)
                            ''',(company,name,email,password,'高'))
                        except:
                            abort(500,'新增帳號時發生不明錯誤')
                        conn.commit()
                        close_db(conn,cursor)

                        # 新增完更新session
                        session['user']={
                            'company':company,
                            'name':name,
                            'email':email,
                            'auth':'高'
                        }
                    else:
                        abort(400,'新增失敗，信箱 已被使用')
                else:
                    abort(400,'新增失敗，公司名稱 已被使用')
        else:
            print('post 新增其他使用者帳號')
            print(request.json)
            company=session['user']['company']
            authority=request.json['authority']
            # check email is exist
            cursor.execute('select name, email from accounts where name=%s or email=%s',(name,email))
            get_one=cursor.fetchone()
            if get_one==None:
                try:
                    # insert account
                    cursor.execute('''
                    insert into accounts (company, name, email, password, authority) values(%s,%s,%s,%s,%s)
                    ''',(company,name,email,password,authority))
                except:
                    abort(500,'新增帳號時發生不明錯誤')
                conn.commit()
                close_db(conn,cursor)
            else:
                abort(400,'新增失敗，名稱或信箱 已被使用')

        return jsonify({'result':'success'}),200

    if request.method=='PATCH':
        print('PATCH 更新帳號資料')
        print(request.json)
        conn,cursor=connect_db(db)
        try:
            cursor.execute('''
            select * from accounts where name = %s or email = %s
            ''',(request.json['name'],request.json['email']))
        except:
            abort(500)
        else:
            # check name or email used by someone
            get_repeat=cursor.fetchall()
            print(get_repeat)
            new_name=request.json['name']
            new_email=request.json['email']
            old_password=to_hash(request.json['oldPassword'])
            new_password=to_hash(request.json['newPassword'])
            
            if get_repeat == []:
                try:
                    cursor.execute('''
                    update accounts set name=%s, email=%s, password=%s, where name=%s and password=%s
                    ''',(new_name,new_email,new_password,request.json['originName'],old_password))
                except:
                    abort(500,'修改帳號時發生不明錯誤')
                conn.commit()
                close_db(conn,cursor)
                
                if session['user']['name']==request.json['originName']:
                    company=session['user']['company']
                    session.pop('user')
                    user={
                        'company':company,
                        'name':new_name,
                        'email':new_email,
                    }
                    session['user']=user
                    print('new',session)
            else:
                abort(400,'修改失敗， 名稱或Email 已被使用')

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
 


def to_hash(password):
    hash_type = hashlib.sha256()
    password=password.encode(encoding='UTF-8')
    hash_type.update(password)
    p = hash_type.hexdigest()
    return p

def connect_db(db):
    conn=db.get_connection()
    cursor=conn.cursor()
    return conn,cursor

def close_db(conn,cursor):
    cursor.close()
    conn.close()