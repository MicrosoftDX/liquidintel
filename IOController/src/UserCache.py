
import logging, threading
import DXLiquidIntelApi
import NotifyVariable

log = logging.getLogger(__name__)

class UserCache(object):

    def __init__(self, liquidApi, cacheTtlVariable):
        self._liquidApi = liquidApi
        self._cacheTtlVariable = cacheTtlVariable
        self._users = {}
        self._extraUsers = {}
        # Initial population is synchronous
        self.populate()

    def __enter__(self):
        pass

    def __exit__(self, type, value, traceback):
        if self._timer:
            self._timer.cancel()

    def populate(self):
        refreshInterval = self._cacheTtlVariable.value
        log.info('Refreshing user cache from api')
        users = self._liquidApi.getValidUsersByCardId() 
        if len(users) > 0:
            self._users = users
            log.info('User cache refreshed with %d entries', len(self._users))
        else:
            log.warn('API call to fetch valid users returned an empty set. Retry in 1 minute.')
            refreshInterval = 60
        self._timer = threading.Timer(refreshInterval, self.populate)
        self._timer.start()

    def lookup(self, cardKey):
        return self._users.get(cardKey) or self._extraUsers.get(cardKey)

    def add(self, cardKey, user):
        self._extraUsers[cardKey] = user
        
        

    
