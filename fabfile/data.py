#!/usr/bin/env python

"""
Commands that update or process the application data.
"""
from elex.api.api import Elections
from fabric.api import local, task, require, run
from fabric.state import env
from models import models

import app_config


@task(default=True)
def update():
    """
    Stub function for updating app-specific data.
    """
    pass


@task
def bootstrap_db():
    """
    Build the database.
    """
    require('settings', provided_by=['production', 'staging', 'dev'])

    if env.settings == 'dev':
        local('dropdb --if-exists %s' % app_config.DATABASE['name'])
        local('createdb %s' % app_config.DATABASE['name'])
    else:
        # use correct connection string and do it
        pass

    models.Results.create_table()


@task
def bootstrap_data(election_date=None):
    """
    Bootstrap races, candidates, reporting units, and ballot positions.
    """
    print('Not implemented')


@task
def load_results(election_date=None):
    require('settings', provided_by=['production', 'staging', 'dev'])

    if not election_date:
        next_election = Elections().get_next_election()
        election_date = next_election.serialize().get('electiondate')

    if env.settings == 'dev':
        local('elex results %s | psql %s -c "COPY results FROM stdin DELIMITER \',\' CSV HEADER;"' % (election_date, app_config.DATABASE['name']))
    else:
        pass
        # use correct connection string
