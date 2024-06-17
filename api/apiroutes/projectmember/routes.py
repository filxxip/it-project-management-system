from typing import Dict, Tuple, Any
from flask import request, jsonify, g
from . import projectmembers
from database.map_db import ProjectMember, User
from ..utils import require_project_access
from ..commitoperations import delete_object, add_object


def remove_user_relation(project_id: int, user_id: int) -> Tuple[Dict[str, str], int]:
    """
    Remove the relationship between a user and a project.

    :param project_id: The ID of the project.
    :param user_id: The ID of the user.
    :return: A JSON response with a success message and a 200 status code if successful,
             otherwise an error message with a 404 status code.
    """
    project_member = g.session.query(ProjectMember).filter(
        ProjectMember.member_id == user_id,
        ProjectMember.project_id == project_id
    ).first()

    if not project_member:
        return jsonify({'error': 'Project member relation not found'}), 404

    delete_object(project_member)
    return jsonify({'message': 'Project relation deleted successfully'}), 200


@projectmembers.route('/<int:project_id>', methods=['DELETE'])
@require_project_access('project_id')
def delete_user_project_relation(project_id: int) -> Tuple[Dict[str, str], int]:
    """
    Delete the current user's relation to a specific project.

    :param project_id: The ID of the project.
    :return: A JSON response with a success message and a 200 status code if successful,
             otherwise an error message with a 404 status code.
    """
    return remove_user_relation(project_id, g.user.user_id)


@projectmembers.route('/<int:project_id>/<int:user_id>', methods=['DELETE'])
@require_project_access('project_id')
def delete_specific_user_project_relation(project_id: int, user_id: int) -> Tuple[Dict[str, str], int]:
    """
    Delete a specific user's relation to a specific project.

    :param project_id: The ID of the project.
    :param user_id: The ID of the user.
    :return: A JSON response with a success message and a 200 status code if successful,
             otherwise an error message with a 404 status code.
    """
    return remove_user_relation(project_id, user_id)


@projectmembers.route('', methods=['POST'])
@require_project_access('project_id')
def assign_project_to_user() -> Tuple[Dict[str, Any], int]:
    """
    Assign a user to a project based on their email.

    :return: A JSON response with a success message and the user ID, and a 200 status code if successful,
             otherwise an error message with a 400 or 404 status code.
    """
    data = request.get_json()
    user_email = data.get('email')
    project_id = data.get('project_id')

    if not user_email or not project_id:
        return jsonify({'error': 'Email and project_id are required'}), 400

    user = g.session.query(User).filter(User.email == user_email).first()

    if not user:
        return jsonify({'error': 'User not found'}), 404

    existing_relation = g.session.query(ProjectMember).filter(
        ProjectMember.member_id == user.user_id,
        ProjectMember.project_id == project_id
    ).first()

    if existing_relation:
        return jsonify({'error': 'User already assigned to this project'}), 400

    new_relation = ProjectMember(member_id=user.user_id, project_id=project_id)
    add_object(new_relation)

    return jsonify({'message': 'Project assigned to user successfully', 'user_id': user.user_id}), 200


@projectmembers.route('/<int:project_id>', methods=['GET'])
@require_project_access('project_id')
def get_project_members(project_id: int) -> Tuple[Dict[str, Any], int]:
    """
    Retrieve the members of a specific project.

    :param project_id: The ID of the project.
    :return: A JSON response with a list of project members and a 200 status code.
    """
    members = g.session.query(User).join(ProjectMember, User.user_id == ProjectMember.member_id).filter(
        ProjectMember.project_id == project_id).all()
    members_data = [{'user_id': member.user_id, 'email': member.email} for member in members]

    return jsonify({'members': members_data}), 200
