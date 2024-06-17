from flask import Blueprint

sprints = Blueprint('sprints', __name__, url_prefix='/sprint')

from .routes import *