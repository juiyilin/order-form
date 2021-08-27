from flask import Flask, render_template,Blueprint,jsonify,session,request,redirect,url_for
from os import urandom

from api.accounts import accounts
from api.products import products
from api.shows import shows
from api.orders import orders
from api.export import export


app = Flask(__name__)
app.register_blueprint(accounts, url_prefix='/api')
app.register_blueprint(products, url_prefix='/api')
app.register_blueprint(shows, url_prefix='/api')
app.register_blueprint(orders, url_prefix='/api')
app.register_blueprint(export)

app.config['JSON_AS_ASCII']=False
app.config["TEMPLATES_AUTO_RELOAD"]=True
#app.config['SEND_FILE_MAX_AGE_DEFAULT']=0
app.secret_key=urandom(24)



@app.route('/')
def index():
	if 'company' in session:
		return redirect(url_for('menu',company=session['company']['company']))
	return render_template('index.html')

@app.route('/<company>/menu')
def menu(company):
	if 'company' not in session:
		return redirect('/')
	if (session['company']['company']!=company) :
		return redirect(url_for('menu',company=session['company']['company']))
	
	return render_template('menu.html')
@app.route('/<company>/accounts')
def account(company):
	if 'company' not in session:
		return redirect('/')
	if (session['company']['company']!=company) :
		return redirect(url_for('menu',company=session['company']['company']))
	name=request.args.get('name')
	print('query name',name)
	if name==None:
		return render_template('account.html')
	else:
		return render_template('edit_account.html')
	
@app.route('/<company>/products')
def product(company):
	if 'company' not in session:
		return redirect('/')
	if (session['company']['company']!=company) :
		return redirect(url_for('menu',company=session['company']['company']))
	return render_template('product.html')

@app.route('/<company>/shows')
def show(company):
	if 'company' not in session:
		return redirect('/')
	if (session['company']['company']!=company) :
		return redirect(url_for('menu',company=session['company']['company']))
	return render_template('show.html')
	
@app.route('/<company>/shows/<show_name>')
def list_order(company,show_name):
	if 'company' not in session:
		return redirect('/')
	if (session['company']['company']!=company) :
		return redirect(url_for('menu',company=session['company']['company']))
	return render_template('order.html')

@app.route('/<company>/shows/<show_name>/<int:order_id>')
def order(company,show_name,order_id):
	if 'company' not in session:
		return redirect('/')
	if (session['company']['company']!=company) :
		return redirect(url_for('menu',company=session['company']['company']))
	return render_template('order_id.html')
	
@app.route('/<company>/shows/<show_name>/charts')
def chart(company,show_name):
	if 'company' not in session:
		return redirect('/')
	if (session['company']['company']!=company) :
		return redirect(url_for('menu',company=session['company']['company']))
	return render_template('chart.html')

# error handle
@app.errorhandler(400)
def input_error(error):
	result={}
	result['success']=False
	result['message']=error.description
	return jsonify(result), 400
 
@app.errorhandler(403)
def input_error(error):
	result={}
	result['success']=False
	result['message']='未登入系統'
	return jsonify(result), 403

@app.errorhandler(500)
def server_error(error):
	result={}
	result['success']=False
	result['message']=error.description
	return jsonify(result),500

if __name__ == '__main__':
    app.run(host='0.0.0.0',debug=True)
 