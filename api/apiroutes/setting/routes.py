from typing import Any, Dict, Tuple
from flask import Blueprint, request, jsonify, g
from ..session import Session
from database.map_db import UserSettings
from ..utils import require_user
from . import settings

@settings.route('', methods=['GET'])
@require_user
def get_user_settings() -> Tuple[Dict[str, Any], int]:
    """
    Retrieve the current user's settings.

    :return: A JSON response with the user's settings and a 200 status code.
    """
    user_id = g.user.user_id
    settings = g.session.query(UserSettings).filter_by(user_id=user_id).first()

    return jsonify({
        'user_id': settings.user_id,
        'auto_logoff_time': settings.auto_logoff_time,
        'auto_logoff_enabled': settings.auto_logoff_enabled,
        'theme_mode': settings.theme_mode
    }), 200


@settings.route('', methods=['PUT'])
@require_user
def update_user_settings() -> Tuple[Dict[str, str], int]:
    """
    Update the current user's settings.

    :return: A JSON response with a success message and a 200 status code.
    """
    user_id = g.user.user_id
    settings = g.session.query(UserSettings).filter_by(user_id=user_id).first()

    data = request.get_json()
    if 'auto_logoff_time' in data:
        settings.auto_logoff_time = data['auto_logoff_time']
    if 'auto_logoff_enabled' in data:
        settings.auto_logoff_enabled = data['auto_logoff_enabled']
    if 'theme_mode' in data:
        settings.theme_mode = data['theme_mode']

    g.session.commit()
    return jsonify({
        'Success': 'Settings updated'
    }), 200
