from typing import Any, Callable
from flask import g


def commit_operation(operation: Callable[[Any], None], obj: Any) -> None:
    """
    Execute an operation (add or delete) on an object within the session and commit the transaction.

    :param operation: The operation to perform (e.g., g.session.add or g.session.delete).
    :param obj: The object to operate on.
    """
    try:
        operation(obj)
        g.session.commit()
    except Exception as e:
        g.session.rollback()
        raise e


def get_operation_function(operation_name: str) -> Callable[[Any], None]:
    """
    Get a function that performs the given operation on an object and commits the session.

    :param operation_name: The name of the operation to perform ('add' or 'delete').
    :return: A function that takes an object and performs the operation on it.
    """
    def operation_func(obj: Any) -> None:
        operation = getattr(g.session, operation_name)
        commit_operation(operation, obj)

    return operation_func


add_object = get_operation_function('add')
delete_object = get_operation_function('delete')
