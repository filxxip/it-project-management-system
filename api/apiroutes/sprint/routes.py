from typing import Dict, Tuple
from flask import request, jsonify, g
from database.map_db import Sprint
from ..utils import require_sprint_access, require_project_access
from . import sprints
from ..commitoperations import delete_object, add_object


@sprints.route('', methods=['POST'])
@require_project_access('project_id')
def add_sprint() -> Tuple[Dict[str, str], int]:
    """
    Add a new sprint to a specific project.

    :return: A JSON response with a success message and a 201 status code if successful,
             otherwise an error message with a 404 status code.
    """
    data = request.get_json()

    if not data['name']:
        return jsonify({'error': 'Sprint name cannot be empty!'}), 404

    sprint = Sprint(
        name=data['name'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        project_id=data['project_id']
    )
    add_object(sprint)
    return jsonify({'success': 'Sprint added'}), 201


@sprints.route('/<int:sprint_id>', methods=['DELETE'])
@require_sprint_access('sprint_id')
def delete_sprint(sprint_id: int) -> Tuple[Dict[str, str], int]:
    """
    Delete a specific sprint.

    :param sprint_id: The ID of the sprint to be deleted.
    :return: A JSON response with a success message if the sprint is deleted,
             otherwise an error message with a 404 status code.
    """
    sprint = g.session.query(Sprint).filter(Sprint.sprint_id == sprint_id).first()
    if sprint:
        delete_object(sprint)
        return jsonify({'success': 'Sprint deleted'})
    return jsonify({'error': 'Sprint not found'}), 404


@sprints.route('/by_project/<int:project_id>', methods=['GET'])
@require_project_access('project_id')
def get_sprints_by_project(project_id: int) -> Tuple[Dict[str, str], int]:
    """
    Get sprints by project.

    :param project_id: The ID of the project.
    :return: A JSON response with a list of sprints for the specified project.
    """
    sprints = g.session.query(Sprint).filter(Sprint.project_id == project_id).all()
    return jsonify([{
        'sprint_id': sprint.sprint_id,
        'name': sprint.name,
        'start_date': sprint.start_date.isoformat() if sprint.start_date else None,
        'end_date': sprint.end_date.isoformat() if sprint.end_date else None,
        'project_id': sprint.project_id
    } for sprint in sprints])
