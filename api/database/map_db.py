import bcrypt
from sqlalchemy import Column, Integer, String, Text, ForeignKey, Date, TIMESTAMP, Sequence, Boolean
from sqlalchemy.orm import relationship, registry

# SQLAlchemy mapper registry
mapper_registry = registry()


@mapper_registry.mapped
class User:
    """
    Represents the 'users' table in the database.

    Attributes:
        user_id (int): Unique identifier for the user.
        username (str): Username of the user.
        _password_hash (str): Hashed password of the user.
        email (str): Email address of the user.
        company (str): Company of the user.
        phone (str): Phone number of the user.
        sex (str): Gender of the user.
    """
    __tablename__ = 'users'
    user_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    username = Column(String(255), unique=True, nullable=False)
    _password_hash = Column('password_hash', String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    company = Column(String(50), nullable=False)
    phone = Column(String(50), nullable=False)
    sex = Column(String(50), nullable=False)

    @property
    def password(self):
        """Password is not readable."""
        raise AttributeError("Password is not readable")

    @password.setter
    def password(self, password: str):
        """Hashes the password and stores it in the database."""
        self._password_hash = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

    def verify_password(self, password: str) -> bool:
        """
        Verifies the user's password.

        Args:
            password (str): The password to verify.

        Returns:
            bool: True if the password is correct, False otherwise.
        """
        return bcrypt.checkpw(password.encode('utf-8'), self._password_hash.encode('utf-8'))


@mapper_registry.mapped
class Project:
    """
    Represents the 'projects' table in the database.

    Attributes:
        project_id (int): Unique identifier for the project.
        name (str): Name of the project.
        description (str): Description of the project.
        created_by (int): ID of the user who created the project.
        creator (User): Relationship to the User who created the project.
    """
    __tablename__ = 'projects'
    project_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    created_by = Column(Integer, ForeignKey('users.user_id'))
    creator = relationship("User", backref="projects")


@mapper_registry.mapped
class Sprint:
    """
    Represents the 'sprints' table in the database.

    Attributes:
        sprint_id (int): Unique identifier for the sprint.
        project_id (int): ID of the project the sprint belongs to.
        name (str): Name of the sprint.
        start_date (Date): Start date of the sprint.
        end_date (Date): End date of the sprint.
        project (Project): Relationship to the Project the sprint belongs to.
    """
    __tablename__ = 'sprints'
    sprint_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey('projects.project_id'))
    name = Column(String(255))
    start_date = Column(Date)
    end_date = Column(Date)
    project = relationship("Project", backref="sprints")


@mapper_registry.mapped
class Task:
    """
    Represents the 'tasks' table in the database.

    Attributes:
        task_id (int): Unique identifier for the task.
        sprint_id (int): ID of the sprint the task belongs to.
        project_id (int): ID of the project the task belongs to.
        title (str): Title of the task.
        description (str): Description of the task.
        status (str): Status of the task.
        assigned_to (int): ID of the user assigned to the task.
        sprint (Sprint): Relationship to the Sprint the task belongs to.
        assignee (User): Relationship to the User assigned to the task.
        project (Project): Relationship to the Project the task belongs to.
    """
    __tablename__ = 'tasks'
    task_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    sprint_id = Column(Integer, ForeignKey('sprints.sprint_id'))
    project_id = Column(Integer, ForeignKey('projects.project_id'))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(String(50), default='todo')
    assigned_to = Column(Integer, ForeignKey('users.user_id'), nullable=True)
    sprint = relationship("Sprint", backref="tasks")
    assignee = relationship("User", backref="tasks")
    project = relationship("Project", backref="tasks")


@mapper_registry.mapped
class Attachment:
    """
    Represents the 'attachments' table in the database.

    Attributes:
        attachment_id (int): Unique identifier for the attachment.
        task_id (int): ID of the task the attachment belongs to.
        file_url (str): URL of the attachment file.
        uploaded_at (TIMESTAMP): Upload timestamp of the attachment.
        task (Task): Relationship to the Task the attachment belongs to.
    """
    __tablename__ = 'attachments'
    attachment_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey('tasks.task_id'))
    file_url = Column(String(255))
    uploaded_at = Column(TIMESTAMP)
    task = relationship("Task", backref="attachments")


@mapper_registry.mapped
class Label:
    """
    Represents the 'labels' table in the database.

    Attributes:
        label_id (int): Unique identifier for the label.
        name (str): Name of the label.
        project_id (int): ID of the project the label belongs to.
        project (Project): Relationship to the Project the label belongs to.
    """
    __tablename__ = 'labels'
    label_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    name = Column(String(255), nullable=False)
    project_id = Column(Integer, ForeignKey('projects.project_id'))
    project = relationship("Project", backref="labels")


@mapper_registry.mapped
class TaskLabel:
    """
    Represents the 'task_labels' table in the database.

    Attributes:
        task_label_id (int): Unique identifier for the task label.
        task_id (int): ID of the task the label is associated with.
        label_id (int): ID of the label the task is associated with.
        task (Task): Relationship to the Task.
        label (Label): Relationship to the Label.
    """
    __tablename__ = 'task_labels'
    task_label_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    task_id = Column(Integer, ForeignKey('tasks.task_id'))
    label_id = Column(Integer, ForeignKey('labels.label_id'))
    task = relationship("Task", backref="task_labels")
    label = relationship("Label", backref="task_labels")


@mapper_registry.mapped
class ProjectMember:
    """
    Represents the 'project_members' table in the database.

    Attributes:
        task_label_id (int): Unique identifier for the project member.
        project_id (int): ID of the project the member is associated with.
        member_id (int): ID of the user who is a member of the project.
        project (Project): Relationship to the Project.
        member (User): Relationship to the User.
    """
    __tablename__ = 'project_members'
    task_label_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    project_id = Column(Integer, ForeignKey('projects.project_id'))
    member_id = Column(Integer, ForeignKey('users.user_id'))
    project = relationship("Project", backref="project_members")
    member = relationship("User", backref="project_members")


@mapper_registry.mapped
class UserSettings:
    """
    Represents the 'user_settings' table in the database.

    Attributes:
        setting_id (int): Unique identifier for the user settings.
        user_id (int): ID of the user these settings belong to.
        auto_logoff_time (int): Auto logoff time in minutes.
        auto_logoff_enabled (bool): Whether auto logoff is enabled.
        theme_mode (str): Theme mode ('light' or 'dark').
        user (User): Relationship to the User.
    """
    __tablename__ = 'user_settings'
    setting_id = Column(Integer, Sequence('id_seq'), primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey('users.user_id'))
    auto_logoff_time = Column(Integer, nullable=False, default=10)
    auto_logoff_enabled = Column(Boolean, nullable=False, default=False)
    theme_mode = Column(String(50), nullable=False, default='light')
    user = relationship("User", backref="settings")


def make_tables(mock_connection):
    """
    Creates all tables in the database.

    Args:
        mock_connection: The database connection to use for creating tables.
    """
    mapper_registry.metadata.create_all(mock_connection)
