import flask
from flask import Flask, render_template, request, url_for, flash, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from flask_socketio import SocketIO, emit, join_room
from transformers import BertTokenizer, BertForSequenceClassification
import torch
import json

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

# Load pre-trained BERT model and tokenizer
tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')
model = BertForSequenceClassification.from_pretrained('bert-base-uncased')
model.eval()

# Load intents from intents.json
with open('intents.json', 'r', encoding='utf-8') as file:
    intents = json.load(file)

@app.get("/")
def index_get():
    return render_template("base.html")

@app.route('/login')
def login():
    # Render the agent login template
    return render_template('agent_login.html')

@app.route('/agent/dashboard')
def agent_dashboard():
    # Render the agent dashboard template
    return render_template('agent_dashboard.html')

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
    
    # Tokenize input text
    inputs = tokenizer(text, return_tensors="pt", padding=True, truncation=True)
    
    # Make prediction using BERT model
    with torch.no_grad():
        outputs = model(**inputs)
        predicted_class = torch.argmax(outputs.logits).item()
    
    # Define response based on predicted class
    if predicted_class == 0:
        response = "I'm sorry, I didn't understand that."
    else:
        response = "Thank you for your message. I'll get back to you shortly."

    # Check if the response is predefined in intents
    for intent in intents['intents']:
        if response in intent['responses']:
            response = intent['responses'][0]
            break
    
    message = {"answer": response}
    return jsonify(message)

@socketio.on('connect')
def handle_connect():
    if current_user.is_authenticated:
        emit('user_status', f'{current_user.username} joined the chat')

@socketio.on('disconnect')
def handle_disconnect():
    if current_user.is_authenticated:
        emit('user_status', f'{current_user.username} left the chat')

if __name__ == "__main__":
    with app.app_context():
        db.create_all()  # Initialize the database
    socketio.run(app, debug=True)
