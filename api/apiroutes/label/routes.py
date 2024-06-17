from typing import Dict, List, Tuple, Any
from flask import request, jsonify, g
from . import labels
from ..commitoperations import delete_object, add_object
from ..utils import require_project_access, require_label_access
from database.map_db import Label


@labels.route('', methods=['POST'])
@require_project_access('project_id')
def add_label() -> Tuple[Dict[str, Any], int]:
    """
    Add a new label to a project.

    :return: A JSON response with a success message and the label ID, and a 201 status code if successful,
             otherwise an error message with a 404 status code.
    """
    data = request.get_json()
    if not data['name']:
        return jsonify({'error': 'Label name cannot be empty'}), 404

    label = Label(
        name=data['name'],
        project_id=data['project_id']
    )
    add_object(label)

    return jsonify({'success': 'Label added', 'label_id': label.label_id}), 201


@labels.route('/<int:label_id>', methods=['DELETE'])
@require_label_access('label_id')
def delete_label(label_id: int) -> Tuple[Dict[str, str], int]:
    """
    Delete a specific label.

    :param label_id: The ID of the label to be deleted.
    :return: A JSON response with a success message and a 200 status code.
    """
    delete_object(g.resource)
    return jsonify({'success': 'Label deleted'}), 200


@labels.route('/by_project/<int:project_id>', methods=['GET'])
@require_project_access('project_id')
def get_labels_by_project(project_id: int) -> Tuple[List[Dict[str, Any]], int]:
    """
    Retrieve all labels for a specific project.

    :param project_id: The ID of the project.
    :return: A JSON response with a list of labels for the specified project and a 200 status code.
    """
    labels = g.session.query(Label).filter(Label.project_id == project_id).all()
    return jsonify([{'label_id': label.label_id, 'name': label.name, 'project_id': label.project_id} for label in labels]), 200
