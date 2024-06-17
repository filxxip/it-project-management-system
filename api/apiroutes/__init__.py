import os
from flask import Flask
from flask_cors import CORS
from flask_session import Session
import redis


def create_app():
    app = Flask(__name__)
    app.secret_key = 'your_secret_key'

    CORS(app, supports_credentials=True, origins="*")
    app.config['SESSION_TYPE'] = 'redis'
    app.config['SESSION_PERMANENT'] = False
    app.config['SESSION_USE_SIGNER'] = True
    app.config['SESSION_KEY_PREFIX'] = 'session:'
    app.config['SESSION_REDIS'] = redis.StrictRedis(
        host=os.getenv('REDIS_HOST', 'localhost'),
        port=int(os.getenv('REDIS_PORT', 6379)),
        db=0,
        decode_responses=False
    )
    app.config.update(
        SESSION_COOKIE_SAMESITE="None",
        SESSION_COOKIE_SECURE=True
    )

    Session(app)

    from .user import users
    app.register_blueprint(users)

    from .project import projects
    app.register_blueprint(projects)

    from .sprint import sprints
    app.register_blueprint(sprints)

    from .task import tasks
    app.register_blueprint(tasks)

    from .tasklabel import tasklabels
    app.register_blueprint(tasklabels)

    from .label import labels
    app.register_blueprint(labels)

    from .projectmember import projectmembers
    app.register_blueprint(projectmembers)

    from .setting import settings
    app.register_blueprint(settings)

    return app
