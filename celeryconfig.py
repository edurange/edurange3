from kombu import Exchange, Queue

task_queues = (
    Queue('eduhint',
            Exchange('eduhint', type='direct'),
            routing_key='eduhint',
            queue_arguments = {'x-max-priority': 10}
        ),
)

task_routes = {

    # EDUHints tasks
    'myapp.tasks.initialize_system_resources_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'myapp.tasks.update_system_resources_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'myapp.tasks.get_recent_student_logs_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'myapp.tasks.query_small_language_model_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

    'myapp.tasks.cancel_generate_hint_task': {
        'queue': 'eduhint',
        'routing_key': 'eduhint',
    },

}

# Global worker defaults
worker_concurrency = 1
worker_prefetch_multiplier = 1


# Define each task route's priority
task_annotations = {

    # Give EDUHints tasks highest priority for sake of performance.
    'myapp.tasks.initialize_system_resources_task': {'priority': 10},
    'myapp.tasks.update_system_resources_task': {'priority': 10},
    'myapp.tasks.get_recent_student_logs_task': {'priority': 10},
    'myapp.tasks.query_small_language_model_task': {'priority': 10},
    'myapp.tasks.cancel_generate_hint_task': {'priority': 10}
}


# Flower configs
worker_send_task_events = True
task_send_sent_event = True



