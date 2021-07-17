from flask import Blueprint, request, session, jsonify, abort
from create_db_table import db, connect_db, close_db
import json

orders = Blueprint('orders', __name__)

@orders.route('/orders', methods = ['GET', 'POST'])
def order():
    conn,cursor=connect_db(db)
    company_id=session['company']['id']
    show_id=session['show']['id']
    if request.method=='GET':
        print('get all orders')
        try:
            cursor.execute('''
            select orders.customer,orders.products,orders.quantities,orders.total, accounts.name from orders 
            inner join accounts on orders.submitter_id = accounts.id 
            where orders.company_id=%s and orders.show_id=%s
            ''',(company_id,show_id))
        except:
            abort(500,'資料庫錯誤')
        get_all=cursor.fetchall()
        close_db(conn,cursor)
        return_data=[]
        keys=['customer','products','quantities','total','name']
        print(get_all)
        for row in get_all:
            data=data_handle(keys,row)
            return_data.append(data)
        print(return_data)
        return jsonify(return_data),200

    if request.method=="POST":
        print('post order')
        print(request.json)
        submitter_id=session['user']['id']
        customer=request.json['customer']
        products=json.dumps(request.json['products']).encode('ascii')
        quantities=json.dumps(request.json['quantities']).encode('ascii')
        total=request.json['total']
        phone=request.json['phone']
        email=request.json['email']
        address=request.json['address']
        tax_id=request.json['taxId']
        comment=request.json['comment']

        try:
            cursor.execute('''
                insert into orders (company_id, submitter_id, show_id, customer,products, quantities, total, phone, email, address, tax_id, comment) values(%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
            ''',(company_id,submitter_id,show_id,customer,products,quantities,total,phone,email,address,tax_id,comment))
        except:
            abort(500)
        conn.commit()
        close_db(conn,cursor)
        return jsonify({'success':True}),200

@orders.route('/order/<orderNum>', methods = ['GET', 'PATCH'])
def order_id(orderNum):
    conn,cursor=connect_db(db)
    company_id=session['company']['id']
    show_id=session['show']['id']
    order_num=int(orderNum)-1
    if request.method=='GET':
        print('get one order')
        try:
            cursor.execute('''
            select orders.customer,orders.products,orders.quantities,orders.total,orders.phone,orders.email,orders.address,orders.tax_id,orders.comment, accounts.name from orders 
            inner join accounts on orders.submitter_id = accounts.id 
            where orders.company_id=%s and orders.show_id=%s limit %s,1
            ''',(company_id,show_id,order_num))
        except:
            abort(500)

        get_one=cursor.fetchone()
        close_db(conn,cursor)
        print(get_one)
        keys=['customer','products','quantities','total','phone','email','address','tax_id','comment','submitter']
        data=data_handle(keys,get_one)
        
        return jsonify(data),200
    if request.method=='PATCH':
        print('patch one order')
        print(request.json)
        customer=request.json['customer']
        products=json.dumps(request.json['products']).encode('ascii')
        quantities=json.dumps(request.json['quantities']).encode('ascii')
        total=request.json['total']
        phone=request.json['phone']
        email=request.json['email']
        address=request.json['address']
        tax_id=request.json['taxId']
        comment=request.json['comment']
        #get id
        try:
            cursor.execute('''
            select orders.id from orders 
            inner join accounts on orders.submitter_id = accounts.id 
            where orders.company_id=%s and orders.show_id=%s limit %s,1
            ''',(company_id,show_id,order_num))
        except:
            abort(500)
        get_id=cursor.fetchone()[0]
        try:
            cursor.execute('''update orders set customer=%s, products=%s,quantities=%s, total=%s, phone=%s, email=%s, address=%s, tax_id=%s, comment=%s where id=%s''',(customer,products,quantities,total,phone,email,address,tax_id,comment,get_id))
        except:
            abort(500,'修改時遇到錯誤')
        conn.commit()
        close_db(conn,cursor)
        return jsonify({'success':True})



def data_handle(keys,data_row):
    data={}
    for i in range(len(data_row)):
        if i==1 or i==2:
            json_data=json.loads(data_row[i])
            data[keys[i]]=json_data
        else:
            data[keys[i]]=data_row[i]
    return data