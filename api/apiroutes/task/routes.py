from typing import Dict, Tuple
from flask import request, jsonify, g
from sqlalchemy.orm import joinedload
from database.map_db import Label, Sprint, Task, TaskLabel, User
from ..utils import require_task_access, require_project_access
from . import tasks
from ..commitoperations import add_object, delete_object


@tasks.route('/<int:task_id>', methods=['GET'])
@require_task_access('task_id')
def get_task(task_id):
    """
    Retrieve a specific task along with its associated labels.

    :param task_id: The ID of the task to retrieve.
    :return: A JSON response with the task details and associated labels.
    """
    task = g.resource
    task_labels = (
        g.session.query(TaskLabel)
        .options(joinedload(TaskLabel.label))
        .filter(TaskLabel.task_id == task_id)
        .all()
    )
    labels = [{'label_id': tl.label.label_id, 'name': tl.label.name, 'project_id': tl.label.project_id} for tl in task_labels]

    return jsonify({
        'task_id': task.task_id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'sprint_id': task.sprint_id,
        'assigned_to': task.assigned_to,
        'project_id': task.project_id,
        'labels': labels
    })


@tasks.route('', methods=['POST'])
@require_project_access('project_id')
def add_task():
    """
    Add a new task to a specific project.

    :return: A JSON response with a success message and a 201 status code if successful,
             otherwise an error message with a 404 status code.
    """
    data = request.get_json()
    title = data['title']
    desc = data['description']
    if not title or not desc:
        return jsonify({'error': 'Task description and title cannot be empty!'}), 404

    task = Task(
        title=title,
        description=desc,
        status=data['status'],
        sprint_id=data['sprint_id'],
        assigned_to=data['assigned_to'],
        project_id=data['project_id']
    )
    add_object(task)

    return jsonify({'success': 'Task added'}), 201


@tasks.route('/<int:task_id>', methods=['PUT'])
@require_task_access('task_id')
def update_task(task_id: int) -> Tuple[Dict[str, str], int]:
    """
    Update a specific task.

    :param task_id: The ID of the task to be updated.
    :return: A JSON response with a success message and a 200 status code if successful,
             otherwise an error message with a 404 status code.
    """
    data = request.get_json()
    task = g.resource

    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)

    if not task.title or not task.description:
        return {"error": "Task title or description cannot be empty!"}, 404

    task.status = data.get('status', task.status)
    task.sprint_id = data.get('sprint_id', task.sprint_id)
    task.assigned_to = data.get('assigned_to', task.assigned_to)
    task.project_id = data.get('project_id', task.project_id)

    # Clear existing task labels
    g.session.query(TaskLabel).filter(TaskLabel.task_id == task_id).delete()

    # Add new task labels
    if 'labels' in data:
        new_labels = [TaskLabel(task_id=task_id, label_id=label['label_id']) for label in data['labels']]
        g.session.add_all(new_labels)

    add_object(task)

    return jsonify({'message': 'Task updated successfully'}), 200


@tasks.route('/<int:task_id>', methods=['DELETE'])
@require_task_access('task_id')
def delete_task(task_id: int) -> Tuple[Dict[str, str], int]:
    """
    Delete a specific task.

    :param task_id: The ID of the task to be deleted.
    :return: A JSON response with a success message and a 200 status code if successful.
    """
    delete_object(g.resource)

    return jsonify({'message': 'Task deleted successfully'}), 200


@tasks.route('/by_project/<int:project_id>', methods=['GET'])
@require_project_access('project_id')
def get_tasks_by_project(project_id: int) -> Tuple[Dict[str, str], int]:
    """
    Get tasks by project.

    :param project_id: The ID of the project.
    :return: A JSON response with a list of tasks for the specified project.
    """
    label_id = request.args.get('label_id', None)
    sprint_id = request.args.get('sprint_id', None)

    query = g.session.query(Task).filter(Task.project_id == project_id)

    if label_id:
        query = query.join(TaskLabel).filter(TaskLabel.label_id == label_id)

    if sprint_id:
        query = query.filter(Task.sprint_id == sprint_id)

    tasks = query.all()

    def get_label_names_by_ids(label_ids):
        """
        Given a list of label IDs, returns a list of corresponding label names.

        :param label_ids: List of label IDs
        :return: List of label names
        """
        labels = g.session.query(Label).filter(Label.label_id.in_(label_ids)).all()
        label_names = [label.name for label in labels]
        return label_names

    return jsonify([{
        'task_id': task.task_id,
        'title': task.title,
        'description': task.description,
        'status': task.status,
        'sprint_id': task.sprint_id,
        'assigned_to': task.assigned_to,
        'project_id': task.project_id,
        'label_names': get_label_names_by_ids([tl.label_id for tl in task.task_labels])} for task in tasks]), 200


@tasks.route('/details/<int:task_id>', methods=['GET'])
@require_task_access('task_id')
def get_task_details(task_id):
    """
    Retrieve detailed information about a specific task, including labels, users, sprints, and project labels.

    :param task_id: The ID of the task to retrieve details for.
    :return: A JSON response with detailed task information.
    """
    task = g.resource
    task_labels = (
        g.session.query(TaskLabel)
        .options(joinedload(TaskLabel.label))
        .filter(TaskLabel.task_id == task_id)
        .all()
    )
    labels = [{'label_id': tl.label.label_id, 'name': tl.label.name, 'project_id': tl.label.project_id} for tl in task_labels]

    users = g.session.query(User).all()
    sprints = g.session.query(Sprint).filter(Sprint.project_id == task.project_id).all()
    project_labels = g.session.query(Label).filter(Label.project_id == task.project_id).all()

    return jsonify({
        'task': {
            'task_id': task.task_id,
            'title': task.title,
            'description': task.description,
            'status': task.status,
            'sprint_id': task.sprint_id,
            'assigned_to': task.assigned_to,
            'project_id': task.project_id,
            'labels': labels
        },
        'users': [{'user_id': user.user_id, 'email': user.email} for user in users],
        'sprints': [{'sprint_id': sprint.sprint_id, 'name': sprint.name} for sprint in sprints],
        'project_labels': [{'label_id': label.label_id, 'name': label.name} for label in project_labels]
    })
