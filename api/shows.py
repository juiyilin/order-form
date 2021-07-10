from flask import Blueprint,request,session,jsonify,abort
from create_db_table import db,connect_db,close_db


shows = Blueprint( 'shows', __name__ )

@shows.route('/shows',methods=['GET','POST','DELETE'])
def show():
    conn,cursor=connect_db(db)
    company=session['user']['company']
    if request.method=='GET':
        print('get all shows')
        try:
            cursor.execute('''
            select show_name,region,DATE_FORMAT(start,"%Y/%m/%d"),DATE_FORMAT(end,"%Y/%m/%d") from shows 
            where company=%s order by start desc
            ''',(company,))
        except:
            abort(500)
        get_all=cursor.fetchall()
        close_db(conn,cursor)
        # print(get_all)
        shows={}
        shows['domestic']=[]
        shows['foreign']=[]
        for show in get_all:
            data=[show[0],show[2],show[3]]
            
            if show[1]=='domestic':
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
        cursor.execute('select show_name from shows where company=%s and show_name=%s',(company,show_name))
        get_one=cursor.fetchone()
        if get_one==None:
            try:
                cursor.execute('insert into shows (company, show_name, region, start, end) values(%s,%s,%s,%s,%s)',(company,show_name,region,start,end))
            except:
                abort(500,'新增展覽時遇到不明錯誤')
            conn.commit()
            close_db(conn,cursor)

            show={
                'show_name':show_name,
                'region':region,
                'start':start,
                'end':end
            }

            session['show']=show
            return jsonify(dict(session['show'])),200
        else:
            abort(400,'此展覽名稱已存在')

    if request.method=='DELETE':
        print('delete show')
        print(request.json)
        show_name=request.json['showName']
       
        try:
            cursor.execute('delete from shows where company=%s and show_name=%s',(company,show_name))
        except:
            abort(500,'刪除展覽時遇到不明錯誤')
        conn.commit()
        close_db(conn,cursor)
        return jsonify({'success':True}),200
        
