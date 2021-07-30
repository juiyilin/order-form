from flask import Blueprint,request,session,jsonify,abort
from create_db_table import db,connect_db,close_db
from werkzeug.utils import secure_filename
import hashlib
import re
import boto3
from config import bucket_name,AWSAccessKeyId,AWSSecretKey,cdn_domain

accounts = Blueprint( 'accounts', __name__ )



@accounts.route('/status',methods=['GET','PATCH','DELETE'])
def status():
    
    if request.method=='GET':
        print('get 取得session')
        print(session)
        # if 'user' not in session or 'company' not in session:
        #     session['user']=None 
        #     session['company']=None 
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
            cursor.execute('''
            select companys.id, companys.company,companys.logo_link,
            accounts.id, accounts.name, accounts.email, accounts.authority from companys 
            join accounts on companys.id=accounts.company_id where companys.company = %s and accounts.email = %s and accounts.password = %s''',(company,email,password))
        except:
            abort(500,'伺服器發生錯誤')
        else:
            get_first=cursor.fetchone()
            close_db(conn,cursor)
            if get_first==None:
                abort(400,'登入失敗，公司名稱或帳號或密碼錯誤或無此帳號密碼')
            print(get_first)
            company={
                'id':get_first[0],
                'company':get_first[1],
                'logo':get_first[2]
            } 
            user={
                'id':get_first[3],
                'name':get_first[4],
                'email':get_first[5],
                'auth':get_first[6]
            }
        session['company']=company
        session['user']=user
        print(session)
        return jsonify(dict(session)),200

    if request.method=='DELETE':
        print(session.keys())
        session_keys=list(session.keys())
        for k in session_keys:
            session.pop(k)
        return jsonify({'success':True}),200

    
@accounts.route('/company', methods=['PATCH'])
def company():
    if 'company' not in session:
        abort(403)
    print('patch company')
    print(request.files)
    
    company_id=session['company']['id']
    company=session['company']['company']
    img=request.files.get('logo')
    img_link=''
    if img!=None:
        s3 = boto3.client(
            "s3",
            aws_access_key_id=AWSAccessKeyId,
            aws_secret_access_key=AWSSecretKey
        )
        img_link=save_to_s3(s3,img,company,cdn_domain)
        del_link=session.get('company').get('logo')
        if del_link!=None:
            print(del_link.split('net/')[1])
            del_link_id=del_link.split('net/')[1]
            delete_from_s3(s3,bucket_name,del_link_id)
    try:
        conn,cursor=connect_db(db)
        cursor.execute('update companys set logo_link=%s where id=%s',(img_link,company_id))
    except:
        abort(500,'修改logo時發生不明錯誤')
    conn.commit()
    close_db(conn,cursor)
    session.pop('company')
    session['company']={
        'id':company_id,
        'company':company,
        'logo':img_link
    }
    
    return jsonify({'success':True}),200

    

@accounts.route('/content', methods=['GET', 'POST', 'PATCH', 'DELETE'])
def content():
    
    if request.method=='GET':
        if 'company' not in session:
            abort(403)
        else:
            company_id=session['company']['id']
            name=request.args.get('name')
            print('name',name)
            if name!=session['user']['name'] and session['user']['auth']=='一般':
                abort(403,'沒有權限')
            conn,cursor=connect_db(db) 

            if name!=None:
                print('get 取得一筆帳號資料')
            
                cursor.execute('select id, name, email, authority from accounts where company_id=%s and name = %s',(company_id,name))
                get_one=cursor.fetchone()
                if get_one==None:
                    abort(400,'無此資料')
                close_db(conn,cursor)
                print(get_one)
                return jsonify(get_one),200
            else:
                if session['user']['auth']=='高':
                    print('get 取得所有帳號資料')
                    cursor.execute('select name, email, authority from accounts where company_id = %s order by time',(company_id,))
                    get_all=cursor.fetchall()
                    close_db(conn,cursor)

                    return jsonify(get_all),200
                else:
                    abort(403,'沒有權限')

    if request.method=='POST':
        
        conn,cursor=connect_db(db)

        if 'company' in request.form:
            print('post 第一次註冊帳號')
            print(request.form)
            print(request.files.get('logo'))
            company=request.form['company']
            name=request.form['name']
            authority='高'
            img=request.files.get('logo')        
            email=request.form['email']

            #驗證email
            if valid_email(email)==None:
                cursor.execute('delete from companys where company=%s',(company,))
                abort(400,'信箱格式錯誤')
            #hash password
            password=to_hash(request.form['password'])
            # check company is exist
            try: 
                cursor.execute('select * from companys where company = %s',(company,))
            except:
                abort(500,'伺服器錯誤')
            else:
                get_company=cursor.fetchone()
                if get_company == None:
                    img_link=''
                    if img!=None:
                        img_link=save_to_s3(AWSAccessKeyId,AWSSecretKey,img,company,cdn_domain)
                    try:
                        # insert company
                        cursor.execute('insert into companys (company,logo_link) values(%s,%s)',(company,img_link))
                    except:
                        abort(500,'新增公司時發生不明錯誤')
                    
                    else:
                        conn.commit()
                        
                        company_id=cursor.lastrowid
                        #company資料加入session
                        session['company']={
                            'id':company_id,
                            'company':company,
                            'logo':img_link
                        }

                        # 新增管理員帳號
                        user_id=insert_account(cursor,conn,company_id,name,email,password,authority)

                        # 新增完更新session
                        session['user']={
                            'id':user_id,
                            'name':name,
                            'email':email,
                            'auth':authority
                        }
                else:
                    abort(400,'新增失敗，公司名稱 已被使用')
        else:
            print('post 新增其他使用者帳號')
            print(request.json)
            company_id=session['company']['id']
            name=request.json['name']
            #check email
            email=request.json['email']
            if valid_email(email)==None:
                abort(400,'信箱格式錯誤')
            #hash password
            password=to_hash(request.json['password'])
            authority=request.json['authority']

            # check name, email is exist in company
            cursor.execute('select name, email from accounts where company_id=%s and (name=%s or email=%s)',(company_id,name,email))
            get_one=cursor.fetchone()
            if get_one==None:
                insert_account(cursor,conn,company_id,name,email,password,authority)
            else:
                abort(400,'新增失敗，名稱或信箱 已被使用')
            

        return jsonify({'success':True}),200

    if request.method=='PATCH':
        if 'company' not in session:
            abort(403)
        else:
            print('PATCH 更新帳號資料')
            print(request.json)
            
            old_name=request.json['oldName']
            old_email=request.json['oldEmail']
            if valid_email(old_email)==None:
                abort(400,'信箱格式錯誤')
            company_id=session['company']['id']
            user_id=request.json['userId']
            old_password=to_hash(request.json['oldPassword'])
            conn,cursor=connect_db(db)
            
            # check old password is correct
            try:
                cursor.execute('''
                select * from accounts where id=%s and password = %s
                ''',(user_id,old_password))
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
                    
                    #若新舊name、新舊email相同
                    if  old_name==new_name and old_email==new_email:
                        try:
                            cursor.execute('update accounts set password=%s where id=%s',(new_password,user_id))
                        except:
                            abort(500,'修改帳號資料時發生不明錯誤')
                        conn.commit()
                        close_db(conn,cursor)
                    
                    #若新舊name相同、新舊email不同
                    elif old_name==new_name and old_email!=new_email:
                        cursor.execute('select email from accounts where company_id=%s and email=%s',(company_id,new_email))
                        get_one=cursor.fetchone()
                        print('get all', get_one)
                        if get_one==None:
                            try:
                                cursor.execute('''
                                update accounts set name=%s, email=%s, password=%s 
                                where id=%s
                                ''',(new_name,new_email,new_password,user_id))
                            except:
                                abort(500,'修改帳號資料時發生不明錯誤')
                            conn.commit()
                            close_db(conn,cursor)
                            
                            if session['user']['id']==user_id:
                                auth=session['user']['auth']
                                session.pop('user')
                                user={
                                    'id':user_id,
                                    'name':new_name,
                                    'email':new_email,
                                    'auth':auth
                                }
                                session['user']=user
                                print('new',session)
                        else:
                            abort(400,'修改失敗，Email 已被使用')

                    #若新舊name不同、新舊email相同
                    elif old_name!=new_name and old_email==new_email:
                        cursor.execute('select email from accounts where company_id=%s and name=%s',(company_id,new_name))
                        get_one=cursor.fetchone()
                        print('get all', get_one)
                        update_account(conn,cursor,get_one,new_name,new_email,new_password,user_id,'修改失敗，名稱 已被使用')
                    
                    #若新舊name不同、新舊email不同
                    else:
                        cursor.execute('select email from accounts where company_id=%s and (name=%s or email=%s)',(company_id,new_name,new_email))
                        get_one=cursor.fetchone()
                        print('get all', get_one)
                        update_account(conn,cursor,get_one,new_name,new_email,new_password,user_id,'修改失敗，名稱或email已被使用')
                else:
                    abort(400,'原密碼輸入錯誤')
            return jsonify({'success':True}),200


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
                session.pop('company')
                session.pop('user')

            return jsonify({'success':True}),200
 

def valid_email(email):
    pattern=r'^\w+@\w+\.+\w+\.*\w*\.*\w*'
    result=re.match(pattern,email)
    print('valid email result',result)
    return result

def to_hash(password):
    hash_type = hashlib.sha256()
    password=password.encode(encoding='UTF-8')
    hash_type.update(password)
    p = hash_type.hexdigest()
    return p


def insert_account(cursor,conn,company_id,name,email,password,authority):
    try:
        # insert account
        cursor.execute('''
        insert into accounts (company_id, name, email, password, authority) values(%s,%s,%s,%s,%s)
        ''',(company_id,name,email,password,authority))
    except:
        abort(500,'新增帳號時發生不明錯誤')
    conn.commit()
    user_id=cursor.lastrowid
    close_db(conn,cursor)
    return user_id

def update_account(conn,cursor,get_one,new_name,new_email,new_password,user_id,error_msg):
    if get_one==None:
        try:
            cursor.execute('''
            update accounts set name=%s, email=%s, password=%s 
            where id=%s
            ''',(new_name,new_email,new_password,user_id))
        except:
            abort(500,'修改帳號資料時發生不明錯誤')
        conn.commit()
        close_db(conn,cursor)
        
        if session['user']['id']==user_id:
            auth=session['user']['auth']
            session.pop('user')
            user={
                'id':user_id,
                'name':new_name,
                'email':new_email,
                'auth':auth
            }
            session['user']=user
            print('new',session)
    else:
        abort(400,error_msg)

def save_to_s3(s3,img,company,cdn_domain):
    
    img_name = secure_filename(img.filename)
    s3.upload_fileobj(
        img,
        bucket_name,
        company+'/'+img_name,
        ExtraArgs={
            "ACL": "public-read", #Access control list
            "ContentType": img.content_type
        }
    )
    img_link=f'{cdn_domain}/{company}/{img.filename}'
    return img_link

        
def delete_from_s3(s3,bucket_name,del_link_id):
    response = s3.delete_object(
        Bucket=bucket_name,
        Key=del_link_id
    )
    print(response)