from flask import Flask, render_template,request,redirect
app = Flask(__name__)

order={
    'order_number':'',
    'name':'',
    'phone':'',
    'address':'',
    'product':''
    }
@app.route('/')
def index():
    product_list=['RK2070','RK2121']
    return render_template('create.html',product_list=product_list)

@app.route('/listorder')
def list_order():
    print(order)
    return render_template('order.html',order=order)

@app.route('/save', methods=['POST'])
def save_order():
    if request.method=='POST':
        order={
            'order_number':request.form['order-number'],
            'name':request.form['name'],
            'phone':request.form['phone'],
            'address':request.form['address'],
            'product':request.form.getlist('product')
            }
        print(order)
    return redirect('/') 

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8000, debug=True)
 