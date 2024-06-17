from typing import Any, Dict, Optional, Tuple
from flask import request, jsonify, session as flask_session, g
from sqlalchemy import or_
import re

from . import users
from ..session import Session
from ..utils import require_user
from database.map_db import User, UserSettings
from ..commitoperations import add_object, delete_object


def validate_password(password: str) -> Optional[str]:
    """
    Validate the password according to specific rules.

    :param password: The password to be validated.
    :return: None if the password is valid, otherwise an error message.
    """
    if len(password) < 6:
        return 'Password must be at least 6 characters long'
    return None


@users.route('', methods=['DELETE'])
@require_user
def delete_user() -> Tuple[Dict[str, str], int]:
    """
    Delete the current user from the database.

    :return: A JSON response with a success message and a 200 status code.
    """
    delete_object(g.user)
    return jsonify({'message': 'User deleted successfully'}), 200


@users.route('/login', methods=['POST'])
def login() -> Tuple[Dict[str, str], int]:
    """
    Log in a user by verifying their log_data and password.

    :return: A JSON response with a success message and a 200 status code if successful,
             otherwise an error message with a 404 or 401 status code.
    """
    with Session() as session:
        data = request.get_json()
        log_data = data.get('log_data', '')
        user = session.query(User).filter(or_(User.email == log_data, User.username == log_data)).first()
        if not user:
            return jsonify({'error': f'User {log_data} not found'}), 404

        password = data.get('password', '')

        if user.verify_password(password):
            flask_session['authenticated'] = True
            flask_session['user_id'] = user.user_id  # Przechowuj user_id zamiast email
            return jsonify({'message': 'Login successful'}), 200
        else:
            return jsonify({'error': 'Invalid credentials passed. Check your login and password.'}), 401


@users.route('/logout', methods=['POST'])
@require_user
def logout() -> Tuple[Dict[str, str], int]:
    """
    Log out the current user by clearing their session.

    :return: A JSON response with a success message and a 200 status code.
    """
    flask_session.pop('authenticated', None)
    flask_session.pop('user_id', None)
    return jsonify({'message': 'Logged out'}), 200


@users.route('', methods=['GET'])
@require_user
def get_current_user() -> Tuple[Dict[str, Any], int]:
    """
    Get the current user's data.

    :return: A JSON response with the user's data and a 200 status code.
    """
    user = g.user
    return jsonify({
        'username': user.username,
        'email': user.email,
        'company': user.company,
        'phone': user.phone,
        'sex': user.sex
    }), 200


@users.route('', methods=['PUT'])
@require_user
def update_current_user() -> Tuple[Dict[str, str], int]:
    """
    Update the current user's data.

    :return: A JSON response with a success message and a 200 status code if successful,
             otherwise an error message with a 400 status code.
    """
    data = request.get_json()
    user = g.user

    if new_password := data.get('newPassword'):
        if error := validate_password(new_password):
            return jsonify({'error': error}), 400
        user.password = new_password
    else:
        user.password_hash = data.get('password_hash', user._password_hash)

    user.username = data.get('username', user.username)
    user.company = data.get('company', user.company)
    user.phone = data.get('phone', user.phone)
    user.sex = data.get('sex', user.sex)

    add_object(user)

    return jsonify({'message': 'User updated successfully'}), 200


@users.route('', methods=['POST'])
def create_user() -> Tuple[Dict[str, str], int]:
    """
    Create a new user in the database.

    :return: A JSON response with a success message and a 201 status code if successful,
             otherwise an error message with a 404 status code.
    """
    with Session() as session:
        data = request.get_json()

        username = data.get('username', '')
        email = data.get('email', '')
        password = data.get('password', '')
        company = data.get('company', '')
        phone = data.get('phone', '')
        sex = data.get('sex', '')

        if not all([username, email, password, company, phone, sex]):
            return jsonify({'error': 'Missing required fields'}), 404

        if not len(username) >= 3:
            return jsonify({'error': 'Username must be at least 3 characters long'}), 404

        if not re.match(r"^[a-zA-Z0-9]+([_ -]?[a-zA-Z0-9])*$", username):
            return jsonify({'error': 'Username contains invalid characters'}), 404

        if not re.match(r"^[^@]+@[^@]+\.[^@]+$", email):
            return jsonify({'error': 'Invalid email address format.'}), 404

        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 404

        if session.query(User).filter(User.username == username).first() is not None:
            return jsonify({'error': 'User with this login already exists'}), 404

        if session.query(User).filter(User.email == email).first() is not None:
            return jsonify({'error': 'User with this email already exists'}), 404

        new_user = User(
            username=username,
            email=email,
            password=password,
            company=company,
            phone=phone,
            sex=sex,
        )
        session.add(new_user)
        session.commit()

        new_settings = UserSettings(
            user_id=new_user.user_id,
            auto_logoff_time=10,
            auto_logoff_enabled=False,
            theme_mode='light'
        )
        session.add(new_settings)
        session.commit()

        return jsonify({'message': 'User created successfully'}), 201
