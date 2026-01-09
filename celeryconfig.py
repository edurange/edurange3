from kombu import Exchange, Queue

task_queues = (
    Queue('celery',
            Exchange('celery', type='direct'),
            routing_key='celery'
        ),
    Queue('eduhint',
            Exchange('eduhint', type='direct'),
            routing_key='eduhint',
            queue_arguments = {'x-max-priority': 10}
        ),
)

task_routes = {

    # EDUHints tasks
    'py_flask.utils.tasks.initialize_system_resources_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'py_flask.utils.tasks.update_system_resources_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'py_flask.utils.tasks.get_recent_student_logs_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'py_flask.utils.tasks.query_small_language_model_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'py_flask.utils.tasks.cancel_generate_hint_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    # Default queue tasks (scenario management)
    'py_flask.utils.tasks.create_scenario_task': {
        'queue': 'celery',
        'routing_key': 'celery',
    },

    'py_flask.utils.tasks.start_scenario_task': {
        'queue': 'celery',
        'routing_key': 'celery',
    },

    'py_flask.utils.tasks.stop_scenario_task': {
        'queue': 'celery',
        'routing_key': 'celery',
    },

    'py_flask.utils.tasks.update_scenario_task': {
        'queue': 'celery',
        'routing_key': 'celery',
    },

    'py_flask.utils.tasks.destroy_scenario_task': {
        'queue': 'celery',
        'routing_key': 'celery',
    },

    'py_flask.utils.tasks.scenarioCollectLogs': {
        'queue': 'celery',
        'routing_key': 'celery',
    },

}

# Global worker defaults
worker_concurrency = 1
worker_prefetch_multiplier = 1


# Define each task route's priority
task_annotations = {

    # Give EDUHints tasks highest priority for sake of performance.
    'py_flask.utils.tasks.initialize_system_resources_task': {'priority': 10},
    'py_flask.utils.tasks.update_system_resources_task': {'priority': 10},
    'py_flask.utils.tasks.get_recent_student_logs_task': {'priority': 10},
    'py_flask.utils.tasks.query_small_language_model_task': {'priority': 10},
    'py_flask.utils.tasks.cancel_generate_hint_task': {'priority': 10}
}


# Flower configs
worker_send_task_events = True
task_send_sent_event = True



