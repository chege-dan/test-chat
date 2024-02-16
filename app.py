import flask
from flask import Flask,render_template,request,url_for, flash,jsonify
from chat import get_response
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO, emit, join_room


app = Flask(__name__)
app.config['SECRET_KEY'] = 'DeNt24@CkOvWnAs'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///chat.db'

db = SQLAlchemy(app)
socketio = SocketIO(app)

login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password = db.Column(db.String(100), nullable=False)
    is_agent = db.Column(db.Boolean, default=False)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.get("/")
def index_get():
    return render_template("base.html")

@app.route('/maximize')
def max():
    return render_template('maximize.html')

@app.post("/predict")
def predict ():
    text = request.get_json().get("message")
    response = get_response(text)
    message = {"answer": response}
    return jsonify(message)


if __name__ == "__main__":
    app.run(debug=True )
