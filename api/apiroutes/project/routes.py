from typing import Dict, Tuple, Any
from flask import request, jsonify, g
from . import projects
from ..session import Session
from ..commitoperations import add_object
from ..utils import require_user, require_project_owner_access, require_project_access
from database.map_db import Project, ProjectMember


@projects.route('', methods=['POST'])
@require_user
def add_project() -> Tuple[Dict[str, str], int]:
    """
    Add a new project and assign the user to it.

    :return: A JSON response with a success message and a 201 status code if successful,
             otherwise an error message with a 400 status code.
    """
    data = request.get_json()

    name = data.get('name')
    description = data.get('description')

    if not name or not description:
        return jsonify({'error': 'Name and description cannot be empty'}), 400

    project = Project(
        name=name,
        description=description,
        created_by=g.user.user_id
    )

    add_object(project)
    project_id = project.project_id

    project_member = ProjectMember(
        project_id=project_id,
        member_id=g.user.user_id
    )
    add_object(project_member)

    return jsonify({'success': 'Project added and user assigned'}), 201


@projects.route('/<int:project_id>', methods=['PUT'])
@require_project_owner_access('project_id')
def update_project(project_id: int) -> Tuple[Dict[str, str], int]:
    """
    Update an existing project.

    :param project_id: The ID of the project to be updated.
    :return: A JSON response with a success message and a 200 status code if successful,
             otherwise an error message with a 400 status code.
    """
    data = request.get_json()

    name = data.get('name')
    description = data.get('description')

    if not name or not description:
        return jsonify({'error': 'Name and description cannot be empty'}), 400

    g.resource.name = name
    g.resource.description = description
    g.session.commit()

    return jsonify({'success': 'Project updated'}), 200


@projects.route('/<int:project_id>', methods=['DELETE'])
@require_project_owner_access('project_id')
def delete_project(project_id: int) -> Tuple[Dict[str, str], int]:
    """
    Delete an existing project.

    :param project_id: The ID of the project to be deleted.
    :return: A JSON response with a success message and a 200 status code if successful.
    """
    # TODO: Delete all references
    with Session() as session:
        session.delete(g.resource)
        session.commit()

    return jsonify({'success': 'Project deleted'}), 200


@projects.route('/<int:project_id>', methods=['GET'])
@require_project_access('project_id')
def get_project(project_id: int) -> Tuple[Dict[str, Any], int]:
    """
    Retrieve details of a specific project.

    :param project_id: The ID of the project.
    :return: A JSON response with the project details and a 200 status code.
    """
    is_owner = g.resource.created_by == g.user.user_id

    return jsonify({
        'project_id': g.resource.project_id,
        'name': g.resource.name,
        'description': g.resource.description,
        'created_by': g.resource.created_by,
        'is_owner': is_owner
    }), 200


@projects.route('/mine', methods=['GET'])
@require_user
def get_user_projects() -> Tuple[Any, int]:
    """
    Retrieve all projects associated with the current user.

    :return: A JSON response with a list of projects and a 200 status code.
    """
    user_projects = g.session.query(Project).join(
        ProjectMember).filter(ProjectMember.member_id == g.user.user_id).all()

    projects_list = [{
        'project_id': project.project_id,
        'name': project.name,
        'description': project.description,
        'created_by': project.created_by,
        'is_owner': project.created_by == g.user.user_id
    } for project in user_projects]

    return jsonify(projects_list), 200
