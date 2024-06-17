from flask import Blueprint

labels = Blueprint('labels', __name__, url_prefix='/label')

from .routes import *