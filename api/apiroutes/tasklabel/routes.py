from flask import Blueprint, jsonify, g
from typing import List, Dict, Any

from ..utils import require_task_access
from database.map_db import TaskLabel, Label

tasklabels = Blueprint('tasklabels', __name__)


@tasklabels.route('/<int:task_id>', methods=['GET'])
@require_task_access('task_id')
def get_labels_for_task(task_id: int) -> Any:
    """
    Retrieve all labels associated with a specific task.

    This endpoint requires the user to have access to the specified task.

    :param task_id: The ID of the task.
    :return: A JSON response containing a list of labels associated with the task.
    """
    task_labels: List[TaskLabel] = g.session.query(TaskLabel).filter(TaskLabel.task_id == task_id).all()
    labels: List[Label] = [g.session.query(Label).filter(Label.label_id == tl.label_id).one_or_none() for tl in task_labels]
    labels = [label for label in labels if label is not None]

    labels_data: List[Dict[str, Any]] = [{'label_id': label.label_id, 'label_name': label.name} for label in labels]
    return jsonify(labels_data)
