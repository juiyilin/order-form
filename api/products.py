from os import close
from flask import Blueprint, request, session, jsonify, abort
from create_db_table import db, connect_db, close_db


products = Blueprint('products', __name__)

@products.route('/products', methods = ['GET', 'POST', 'DELETE'])
def category():
    conn, cursor = connect_db(db)
    company = session['user']['company']
    if request.method == 'GET':
        print('get products')
        cursor.execute('select item_number,price from products where company=%s order by item_number', (company, ))
        get_all = cursor.fetchall()
        close_db(conn, cursor)
        return jsonify(get_all), 200

    if request.method == 'POST':
        print('post products')
        print(request.json)
        item_number = request.json['itemNumber']
        price = request.json['price']
        if price == '':
            price = 0
        try:
            cursor.execute('''
                select item_number from products 
                where company = %s and item_number = %s ''',(company,item_number))
        except:
            abort(500) 
        get_one = cursor.fetchone() 
        if get_one == None:
            try:
                cursor.execute('insert into products (item_number,company,price) value(%s,%s,%s)', (item_number, company, price)) 
            except:
                abort(500, '新增產品發生錯誤') 
            conn.commit() 
            close_db(conn, cursor) 
            return jsonify({'success': True}), 200
        else :
            abort(400, '此產品名稱已存在')
    if request.method=='DELETE':
        print('delete products')
        print(request.json)
        item_number=request.json['itemNumber']
        price=request.json['price']
        try:
            cursor.execute('delete from products where item_number=%s and price=%s and company=%s',(item_number,price,company))
        except:
            abort(500,'刪除產品時發生錯誤')
        conn.commit()
        close_db(conn,cursor)
        return jsonify({'success':True}),200