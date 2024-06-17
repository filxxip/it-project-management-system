from typing import Any, Optional, Tuple, Type, Callable
from flask import request, jsonify, session as flask_session, g
from sqlalchemy.orm import Session as DBSession
from functools import partial, wraps

from .session import Session
from database.map_db import Label, Project, ProjectMember, Sprint, Task, User


def require_user(func):
    """
    Decorator that ensures the user is authenticated.

    :param func: The view function to decorate.
    :return: The decorated view function.
    """
    @wraps(func)
    def decorated_view(*args, **kwargs):
        try:
            if 'user_id' in flask_session:
                user_id = flask_session['user_id']
                with Session() as session_db:
                    user = session_db.query(User).filter(User.user_id == user_id).first()
                    if user:
                        g.user = user 
                        g.session = session_db
                        return func(*args, **kwargs)
                    else:
                        return jsonify({'error': 'User not found'}), 404
            else:
                return jsonify({'error': 'Not authenticated'}), 401
        finally:
            g.pop('user', None)
            g.pop('session', None)

    return decorated_view


def user_has_access_to_task(user_id: int, task_id: int, session: DBSession) -> Tuple[bool, Optional[Task]]:
    """
    Check if the user has access to the task.

    :param user_id: The ID of the user.
    :param task_id: The ID of the task.
    :param session: The current database session.
    :return: A tuple containing a boolean indicating if the user has access and the task if found.
    """
    task = session.query(Task).filter(Task.task_id == task_id).first()
    if not task:
        return False, None

    project_member = session.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.member_id == user_id
    ).first()

    return project_member is not None, task


def user_has_access_to_resource(user_id: int, resource_id: int, resource_type: Type, session: DBSession) -> Tuple[bool, Optional[Any]]:
    """
    Check if the user has access to the resource.

    :param user_id: The ID of the user.
    :param resource_id: The ID of the resource.
    :param resource_type: The type of the resource class.
    :param session: The current database session.
    :return: A tuple containing a boolean indicating if the user has access and the resource if found.
    """
    resource = session.query(resource_type).filter_by(**{f"{resource_type.__name__.lower()}_id": resource_id}).first()
    if not resource:
        return False, None

    project_member = session.query(ProjectMember).filter(
        ProjectMember.project_id == resource.project_id,
        ProjectMember.member_id == user_id
    ).first()

    return project_member is not None, resource


def check_project_owner(user_id: int, resource_id: int, resource_type: Type, session: DBSession) -> Tuple[bool, Optional[Any]]:
    """
    Check if the user is the owner of the project.

    :param user_id: The ID of the user.
    :param resource_id: The ID of the project.
    :param resource_type: The type of the resource class.
    :param session: The current database session.
    :return: A tuple containing a boolean indicating if the user is the owner and the project if found.
    """
    project = session.query(resource_type).filter_by(**{f"{resource_type.__name__.lower()}_id": resource_id}).first()
    if not project:
        return False, None

    return project.created_by == user_id, project


def require_resource_access(resource_checker: Callable[[int, int, Type, DBSession], Tuple[bool, Optional[Any]]], resource_type: Type, resource_id_param: str):
    """
    Decorator that ensures the user has access to a specific resource.

    :param resource_checker: Function to check the user's access to the resource.
    :param resource_type: The type of the resource class.
    :param resource_id_param: The name of the parameter that contains the resource ID.
    :return: The decorated view function.
    """
    def decorator(f):
        @require_user
        @wraps(f)
        def decorated_function(*args, **kwargs):
            try:
                if request.method == 'POST':
                    resource_id = request.json.get(resource_id_param)
                else:
                    resource_id = kwargs.get(resource_id_param)

                if not resource_id:
                    return jsonify({'error': f'{resource_type.__name__} ID not provided'}), 400

                with Session() as session_db:
                    has_access, resource = resource_checker(g.user.user_id, resource_id, resource_type, session_db)
                    if not has_access:
                        return jsonify({'error': f'User does not have access to this {resource_type.__name__.lower()} operation'}), 403

                    g.resource = resource
                    g.session = session_db
                    return f(*args, **kwargs)
            finally:
                g.pop('resource', None)
                g.pop('session', None)

        return decorated_function
    return decorator


# Partial functions for specific resource types
require_project_owner_access = partial(require_resource_access, check_project_owner, Project)
require_task_access = partial(require_resource_access, user_has_access_to_resource, Task)
require_project_access = partial(require_resource_access, user_has_access_to_resource, Project)
require_sprint_access = partial(require_resource_access, user_has_access_to_resource, Sprint)
require_label_access = partial(require_resource_access, user_has_access_to_resource, Label)
