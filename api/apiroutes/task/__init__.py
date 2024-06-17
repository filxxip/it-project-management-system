from flask import Blueprint

tasks = Blueprint('tasks', __name__, url_prefix='/task')

from .routes import *