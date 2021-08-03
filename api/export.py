from flask import Blueprint, request, session, jsonify, abort,send_file
from create_db_table import db, connect_db, close_db
import pandas as pd
import json
from io import BytesIO


export = Blueprint('export', __name__)

@export.route('/dataframe')
def dataframe():
    if request.method=='GET':
        print(session.get('company'))
        if session.get('company')==None:
            abort(403)
        company_id=session['company']['id']
        show_id=session['show']['id']
        conn,cursor=connect_db(db)
        orders_df=pd.read_sql('''select orders.customer,orders.products,orders.quantities,orders.total,orders.phone,orders.email,orders.address,orders.tax_id,orders.comment, accounts.name from orders 
            inner join accounts on orders.submitter_id = accounts.id 
            where orders.company_id=%(company_id)s and orders.show_id=%(show_id)s''',conn,params={
                'company_id':company_id,
                'show_id':show_id
            }
        )
        close_db(conn,cursor)
        
        # handle products and quantities
        all_pq=[]
        for idx in range(orders_df.shape[0]):
            products=json.loads(orders_df['products'][idx])
            quantities=json.loads(orders_df['quantities'][idx])
            identity_pq=''
            for i in range(len(quantities)):
                if quantities[i]==0:
                    continue
                else:
                    identity_pq+=f'{products[i]}*{quantities[i]}\n'
            all_pq.append(identity_pq)

        orders_df['品項']=all_pq
        orders_df=orders_df.drop(['products','quantities'],axis=1)
        orders_df=orders_df.rename(columns={
            'customer':'姓名/公司名',
            'total':'總金額',
            'phone':'電話',
            'email':'電子信箱',
            'address':'寄送地址',
            'tax_id':'統編',
            'comment':'備註',
            'name':'填表人'
        })

        #arrange columns
        orders_df=orders_df[['姓名/公司名','品項','總金額','電話','電子信箱','寄送地址','統編', '備註','填表人']]


        output = BytesIO()

        # Use the BytesIO object as the filehandle.
        writer = pd.ExcelWriter(output)
        orders_df.to_excel(writer,index=False)
        writer.save()
        output.seek(0)
        show_name=session['show']['name']
        start=session['show']['start'].replace('/','')
        excel_name=f'{start}{show_name}.xlsx'
        return send_file(output,attachment_filename=excel_name,as_attachment=True)
    else:
        abort(400)