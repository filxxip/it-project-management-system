from flask import Blueprint

projectmembers = Blueprint('projectmembers', __name__, url_prefix='/project_member')

from .routes import *