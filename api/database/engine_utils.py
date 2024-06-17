import configparser
from sqlalchemy import create_engine
from snowflake.sqlalchemy import URL
from functools import partial
import os

_config = configparser.ConfigParser()

_current_file_path = os.path.abspath(__file__)
_current_dir = os.path.dirname(_current_file_path)

_config_path = os.path.join(_current_dir, 'setup.cfg')

_config.read(_config_path)

usr_config = _config['userdata']
db_config = _config['database']

required_keys = {
    'userdata': ['user', 'password', 'account'],
    'database': ['warehouse', 'database', 'schema']
}

for config_section, keys in required_keys.items():
    config = _config[config_section]
    for key in keys:
        if key not in config or not config[key]:
            raise ValueError(f"Missing required configuration for '{key}' in section '{config_section}'. Please provide a value for '{key}'.")


create_user_engine = partial(create_engine, URL(
    user=usr_config['user'],
    password=usr_config['password'],
    account=usr_config['account'],
    warehouse=db_config['warehouse'],
    database=db_config['database'],
    schema=db_config['schema']
))

"""
This module handles the creation of a SQLAlchemy engine configured to connect to a Snowflake database
using the settings defined in a configuration file (setup.cfg).

Configuration File (setup.cfg):
The setup.cfg file should contain the following sections and keys:
    
    [userdata]
    user=<your_snowflake_username>
    password=<your_snowflake_password>
    account=<your_snowflake_account>
    
    [database]
    warehouse=<your_snowflake_warehouse>
    database=<your_snowflake_database>
    schema=<your_snowflake_schema>

Attributes:
    _config (ConfigParser): The ConfigParser object used to read the setup.cfg file.
    _current_file_path (str): The absolute path of the current file.
    _current_dir (str): The directory of the current file.
    _config_path (str): The path to the setup.cfg file.
    usr_config (ConfigParser.SectionProxy): The userdata section from the configuration file.
    db_config (ConfigParser.SectionProxy): The database section from the configuration file.
    create_user_engine (function): A partial function that returns a SQLAlchemy engine configured for Snowflake.

Functions:
    create_user_engine: A partial function that returns a SQLAlchemy engine configured for Snowflake.
"""
