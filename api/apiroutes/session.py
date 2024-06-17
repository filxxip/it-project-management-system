from database.engine_utils import create_user_engine

from sqlalchemy.orm import sessionmaker

Session = sessionmaker(bind=create_user_engine())
