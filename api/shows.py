from flask import Blueprint,request,session,jsonify,abort
from create_db_table import db,connect_db,close_db


shows = Blueprint( 'shows', __name__ )

@shows.route('/shows',methods=['GET','POST','PATCH','DELETE'])
def show():
    conn,cursor=connect_db(db)
    if request.method=='GET':
        print('get all shows')
        try:
            cursor.execute('select show_name,region,DATE_FORMAT(start,"%Y/%m/%d"),DATE_FORMAT(end,"%Y/%m/%d") from shows order by start')
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
        try:
            cursor.execute('insert into shows (show_name, region, start, end) values(%s,%s,%s,%s)',(show_name,region,start,end))
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