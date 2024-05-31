

# the Edurange class should be STATELESS, 
# ie, only include CONSTANTS and PURELY FUNCTIONAL METHODS
# (things that will never change)
# it should probably also be read only

class Edurange:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(er3, cls).__new__(cls)
            cls._instance.initialize()  # Initialize only once
        return cls._instance



    def add_user(self, user):
        self.users.append(user)
        self.status = 'User Added'

    def get_user_count(self):
        return len(self.users)

    def update_config(self, key, value):
        self.config[key] = value

class ER3_static:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(ER3_static, cls).__new__(cls)
            cls._instance.api_key = "secret_api_key_12345"
        return cls._instance
    
    def initialize(self):
        # Here you can initialize all the properties you need
        self.config = {'database_url': 'sqlite:///mydatabase.db'}
        self.status = 'Initializing'
        self.users = []
        
    @staticmethod
    def compute_discount(price, rate):
        """Compute discount given a price and a rate, purely functional."""
        return price * (1 - rate)

    @staticmethod
    def format_date(date):
        """Return formatted date as a string, purely functional."""
        return date.strftime("%Y-%m-%d")
