import argparse
from datetime import date, timedelta
import random
from typing import Dict, List, Union

from sqlalchemy import text, create_engine
from apiroutes.session import Session

from database.engine_utils import create_user_engine, db_config
import database.map_db as mdp


INIT = "init"
DROP = "drop"
CREATE = "create"
MOCK = "mock"
RESET = "reset"


class QueryFileManager:
    """Class to manage SQL query files with parameters."""

    def __init__(self, filename: str, **kwargs: Dict[str, str]):
        """
        Initialize the QueryFileManager.

        Args:
            filename (str): The filename of the SQL query file.
            **kwargs (Dict[str, str]): The parameters to format the query with.
        """
        self.filename = filename
        self.query_params = kwargs


def execute_query(mock_connection, query: QueryFileManager) -> None:
    """
    Execute a formatted SQL query from a file.

    Args:
        mock_connection: The database connection to execute the query on.
        query (QueryFileManager): The query file manager instance containing the query and parameters.
    """
    with open(f"database/queries/{query.filename}", 'r') as file:
        formatted_query = file.read().format(**query.query_params)
    mock_connection.execute(text(formatted_query))


QUERY_FILES = {
    INIT: [
        QueryFileManager('create_warehouse.sql', warehouse_name=db_config["warehouse"]),
        QueryFileManager('create_database.sql', database_name=db_config["database"]),
        QueryFileManager('create_schema.sql', schema_name=db_config["schema"]),
    ],
    DROP: [
        QueryFileManager('drop_database.sql', database_name=db_config["database"]),
        QueryFileManager('drop_warehouse.sql', warehouse_name=db_config["warehouse"]),
    ]
}


def mock_data(engine) -> None:
    """
    Generate and insert mock data into the database.
    """
    with Session() as session:
        def random_date(start: date, end: date) -> date:
            """
            Generate a random date between start and end dates.

            Args:
                start (date): The start date.
                end (date): The end date.

            Returns:
                date: A random date between start and end.
            """
            delta = end - start
            random_days = random.randrange(delta.days)
            return start + timedelta(days=random_days)

        def commit_all(data: List[Union[mdp.User, mdp.Project, mdp.Sprint, mdp.Task, mdp.Attachment, mdp.Label, mdp.TaskLabel, mdp.ProjectMember, mdp.UserSettings]]) -> None:
            """
            Commit a list of data objects to the session.

            Args:
                data (List[Union[mdp.User, mdp.Project, mdp.Sprint, mdp.Task, mdp.Attachment, mdp.Label, mdp.TaskLabel, mdp.ProjectMember, mdp.UserSettings]]): A list of ORM objects to commit.
            """
            for item in data:
                session.add(item)
            session.commit()

        companies = [f"Company {i}" for i in range(1, 11)]
        phones = [f"555-1234{i}" for i in range(100)]
        sexes = ["male", "female", "other"]
        users = [
            mdp.User(
                username=f"user_{i}",
                password=f"password{i}",
                email=f"user_{i}@example.com",
                company=random.choice(companies),
                phone=random.choice(phones),
                sex=random.choice(sexes)
            )
            for i in range(5)
        ]
        commit_all(users)

        user_settings = [
            mdp.UserSettings(
                user_id=user.user_id,
                auto_logoff_time=30,  # Default value
                auto_logoff_enabled=False,  # Default value
                theme_mode='light'  # Default value
            )
            for user in users
        ]
        commit_all(user_settings)

        projects = [
            mdp.Project(name=f"Project_{i}", description=f"Description for project {i}", created_by=random.choice(users).user_id)
            for i in range(10)
        ]
        commit_all(projects)

        sprints = [
            mdp.Sprint(
                project_id=project.project_id,
                name=f"Sprint_{i}",
                start_date=random_date(date(2021, 1, 1), date(2021, 12, 31)),
                end_date=random_date(date(2022, 1, 1), date(2022, 12, 31))
            )
            for i in range(25)
            for project in projects
        ]
        commit_all(sprints)

        tasks = [
            mdp.Task(
                sprint_id=None,
                project_id=random.choice(projects).project_id,
                title=f"Task_{i}",
                description=f"Description for task {i}",
                status=random.choice(["todo", "in progress", "done"]),
                assigned_to=random.choice(users).user_id
            )
            for i in range(random.randrange(40))
        ]
        commit_all(tasks)

        labels = [
            mdp.Label(name=f"Label_{i}", project_id=project.project_id)
            for i in range(random.randrange(3))
            for project in projects
        ]
        commit_all(labels)

        task_labels = [
            mdp.TaskLabel(
                task_id=task.task_id,
                label_id=random.choice(
                    [label.label_id for label in labels if label.project_id == task.project_id]
                )
            )
            for task in random.choices(tasks, k = 20)
        ]
        commit_all(task_labels)

        project_members = [
            mdp.ProjectMember(project_id=project.project_id, member_id=random.choice(users).user_id)
            for project in projects
            for _ in range(2)
        ]
        commit_all(project_members)


def manage_database(operation: str, engine: create_engine) -> None:
    """
    Manage database operations such as init, drop, create, mock, and reset.

    Args:
        operation (str): The operation to perform (init, drop, create, mock, reset).
        engine (create_engine): The SQLAlchemy engine to use for database connections.
    """
    if operation == RESET:
        for op in (DROP, INIT, CREATE, MOCK):
            manage_database(op, engine)
        return

    with engine.connect() as connection:
        if operation in QUERY_FILES:
            for query_data in QUERY_FILES[operation]:
                execute_query(connection, query_data)

        if operation == CREATE:
            mdp.make_tables(connection)

    if operation == MOCK:
        mock_data(engine)


def setup_argparse() -> argparse.ArgumentParser:
    """
    Set up the argument parser for command-line arguments.

    Returns:
        argparse.ArgumentParser: The configured argument parser.
    """
    parser = argparse.ArgumentParser(description='Manage your Snowflake database resources.')
    parser.add_argument('operation', choices=[INIT, DROP, CREATE, MOCK, RESET],
                        help='Operation to perform: initialize, drop, create or mock the database resources')
    return parser


def main() -> None:
    """
    Main entry point of the script.
    """
    parser = setup_argparse()
    args = parser.parse_args()
    engine = create_user_engine()
    manage_database(args.operation, engine)


if __name__ == '__main__':
    main()
