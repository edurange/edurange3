import random
import redis
import pickle

def generate_alphanum(length):
    alphanums = '1234567890abcdefghijklmnopqrstuvwxyz'
    return ''.join(random.choice(alphanums) for _ in range(length))


def handleRedisIO(operation, r_specifiers, key, input_data=None):

    r_host = r_specifiers["host"]
    r_port = r_specifiers["port"]
    r_db = r_specifiers["db"]

    r = redis.StrictRedis(host=r_host, port=r_port, db=r_db)

    def store(r, key, input_data=None):
        try: 
            data_pickle = pickle.dumps(input_data)
            r.set(key, data_pickle)
            
        except Exception as e:
            raise Exception(f"ERROR: Failed to store key: [{key}] to redis cache: {e}")

    def load(r, key):
        try:  
            output_data_pickle = r.get(key)
            if output_data_pickle is None:
                raise Exception(f'ERROR: Failed to load data for: [{key}]')
            else:
                output_data_loaded = pickle.loads(output_data_pickle)
                return output_data_loaded
        except Exception as e:
                raise Exception(f"ERROR: Data for {key} not found in Redis db")

    def delete(r, key):
        try: 
            result = r.delete(key)
            if result == 0:
                raise Exception(f"ERROR: No data found at key: [{key}]")

        except Exception as e:
            raise Exception(f"ERROR: Failed to delete data for key: [{key}] in redis cache: {e}")

    if key is None:
        raise Exception(f"ERROR: Key is None")

    else: 
        if operation == "store":
            if input_data is None:
                raise Exception(f"ERROR: Failed to store data as data is none")
            store(r, key, input_data)
            operation_result = f"Successfully stored data at key: [{key}]"
            return operation_result

        elif operation == "load":
            output_data_loaded = load(r, key)
            return output_data_loaded

        elif operation == "delete":
            delete(r, key)
            operation_result = f"Successfully deleted data at key: {key}"
            return operation_result

        else:
            raise Exception(f"Operation not valid, only store, load and delete are available.")