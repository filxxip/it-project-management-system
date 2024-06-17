from flask import Blueprint

tasklabels = Blueprint('tasklabels', __name__, url_prefix='/task_label')

from .routes import *