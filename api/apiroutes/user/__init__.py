from flask import Blueprint

users = Blueprint('users', __name__, url_prefix='/user')

from .routes import *