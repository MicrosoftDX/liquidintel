
import datetime, time, logging
import pcProx, KegIO, User

log = logging.getLogger(__name__)

class Session(object):
    def __init__(self, user, kegIO, sessionTimeout):
        self.user = user
        self._kegIO = kegIO
        kegIO.resetFlowCount()
        self.tapsCounters = None
        self._endSessionTime = datetime.datetime.utcnow() + datetime.timedelta(seconds=sessionTimeout.value)

    def _end(self):
        # Snapshot our flow sensors
        self.tapsCounters = self._kegIO.getTapsFlowCount()

    @property
    def expired(self):
        return self._endSessionTime < datetime.datetime.utcnow()

# Doubly-linked list implementation of a FIFO queue
class _Fifo: 
    def __init__(self): 
        self._first = None
        self._last = None

    def enqueue(self, data): 
        if self._last:
            self._last = (self._last, None, data)
        else:
            self._last = (None, None, data)
            self._first = self._last

    def dequeue(self): 
        if not self._first:
            return None
        ignore, self._first, retval = self._first
        if not self._first:
            self._last = None
        return retval 

    def putBack(self, data):
        if self._first:
            self._first = (None, self._first, data)
        else:
            self._first = (None, None, data)
            self._last = self._first

    @property
    def isEmpty(self):
        return self._first == None

class SessionManager(object):
    def __init__(self, proxReader, kegIO, apiClient, sessionTimeout):
        self._proxReader = proxReader
        self._kegIO = kegIO
        self._apiClient = apiClient
        self._sessionTimeout = sessionTimeout
        self._pendingSessions = _Fifo()
        self._currentSession = None

    def _endCurrentSession(self):
        if self._currentSession != None:
            self._currentSession._end()
            self._proxReader.beepEndSession()
            self._pendingSessions.enqueue(self._currentSession)
            log.info('Session ended for %d:%s. Tap amounts: [%s]', 
                self._currentSession.user.personnelId, 
                self._currentSession.user.fullName,
                str({tapId:self._currentSession.tapsCounters[tapId] for tapId in self._currentSession.tapsCounters}))
            self._currentSession = None
        
    def apply(self):
        # 3 phases:
        #   1. read card
        #   2. expire current session (if applicable)
        #   3. process the first pending session (if applicable)
        cardId = self._proxReader.readCard()
        if self._currentSession != None:
            # debounce the current session's cardId
            if cardId != 0 and cardId == self._currentSession.user.cardId:
                cardId = 0
            if cardId != 0 or self._currentSession.expired:
                self._endCurrentSession()
        pendingSession = self._pendingSessions.dequeue()
        if pendingSession != None:
            if not self._apiClient.sendSessionDetails(pendingSession.user, pendingSession.tapsCounters):
                # Session activity could not be sent to API - re-insert back into our list
                self._pendingSessions.putBack(pendingSession)
        return cardId

    def startSession(self, user):
        self._endCurrentSession()
        self._currentSession = Session(user, self._kegIO, self._sessionTimeout)

