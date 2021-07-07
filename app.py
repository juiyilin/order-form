from flask import Flask, render_template,Blueprint,jsonify,session,request
from os import urandom
from api.accounts import accounts
from api.shows import shows


app = Flask(__name__)
app.register_blueprint(accounts, url_prefix='/api')
app.register_blueprint(shows, url_prefix='/api')

app.config['JSON_AS_ASCII']=False
app.config['SEND_FILE_MAX_AGE_DEFAULT']=0
app.secret_key=urandom(24)



@app.route('/')
def index():
    return render_template('index.html')
@app.route('/<company>/accounts')
def account(company):
	name=request.args.get('name')
	print('query name',name)
	if name==None:
		print('***',session)
		return render_template('account.html')
	else:
		return render_template('edit_account.html')
	
	
@app.route('/<company>/show')
def show(company):
	return render_template('show.html')
	
@app.route('/<company>/show/<show_name>')
def list_order(company,show_name):
    return render_template('order.html')
	

# error handle
@app.errorhandler(400)
def input_error(error):
	result={}
	result['result']='error'
	result['message']=error.description
	return jsonify(result), 400
 
@app.errorhandler(403)
def input_error(error):
	result={}
	result['result']='error'
	result['message']=error.description
	return jsonify(result), 403

@app.errorhandler(500)
def server_error(error):
	result={}
	result['result']='error'
	result['message']=error.description
	return jsonify(result),500

if __name__ == '__main__':
    app.run(debug=True)
 