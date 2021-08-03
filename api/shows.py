from flask import Blueprint,request,session,jsonify,abort
from create_db_table import db,connect_db,close_db


shows = Blueprint( 'shows', __name__ )

@shows.route('/shows',methods=['GET','POST','DELETE'])
def show():
    if 'company' not in session:
        abort(403)
    else:
        conn,cursor=connect_db(db)
        company_id=session['company']['id']
        if request.method=='GET':
            print('get all shows')
            try:
                cursor.execute('''
                select id,show_name,region,DATE_FORMAT(start,"%Y/%m/%d"),DATE_FORMAT(end,"%Y/%m/%d") from shows 
                where company_id=%s order by start desc
                ''',(company_id,))
            except:
                abort(500)
            get_all=cursor.fetchall()
            close_db(conn,cursor)
            # print(get_all)
            shows={}
            shows['domestic']=[]
            shows['foreign']=[]
            for show in get_all:
                data=[show[0],show[1],show[3],show[4]]
                
                if show[2]=='domestic':
                    shows['domestic'].append(data)
                else:
                    shows['foreign'].append(data)
            print('shows',shows)
            return jsonify(shows),200

        if request.method=='POST':
            print('post show')
            print(request.json)
            show_name=request.json['showName']
            region=request.json['region']
            start=request.json['start']
            end=request.json['end']
            cursor.execute('select show_name from shows where company_id=%s and show_name=%s',(company_id,show_name))
            get_one=cursor.fetchone()
            if get_one==None:
                try:
                    cursor.execute('insert into shows (company_id, show_name, region, start, end) values(%s,%s,%s,%s,%s)',(company_id,show_name,region,start,end))
                except:
                    abort(500,'新增展覽時遇到不明錯誤')
                conn.commit()
                cursor.execute('select id from shows where show_name=%s',(show_name,))
                show_id=cursor.fetchone()[0]
                close_db(conn,cursor)
                show={
                    'id':show_id,
                    'name':show_name,
                    'region':region,
                    'start':start,
                    'end':end
                }

                session['show']=show
                return jsonify({'success':True}),200
            else:
                abort(400,'此展覽名稱已存在')

        if request.method=='DELETE':
            print('delete show')
            print(request.json)
            show_name=request.json['showName']
        
            try:
                cursor.execute('delete from shows where company_id=%s and show_name=%s',(company_id,show_name))
            except:
                abort(500,'刪除展覽時遇到不明錯誤')
            conn.commit()
            close_db(conn,cursor)
            return jsonify({'success':True}),200
        
@shows.route('/show/<show_name>',methods=['GET'])
def show_id(show_name):
    if 'company' not in session:
        abort(403)
    else:
        company_id=session['company']['id']
        conn,cursor=connect_db(db)
        try:
            cursor.execute('select id, show_name, region,DATE_FORMAT(start,"%Y/%m/%d"),DATE_FORMAT(end,"%Y/%m/%d") from shows where company_id=%s and show_name=%s',(company_id,show_name))
        except:
            abort(500)
        get_one=cursor.fetchone()
        close_db(conn,cursor)
        print(get_one)
        show={}
        keys=['id','name','region','start','end']
        for k,v in zip(keys,get_one):
            show[k]=v
        session['show']=show
        return jsonify({'success':True})