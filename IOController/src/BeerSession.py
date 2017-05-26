
import datetime, time, logging
import pcProx, KegIO, User
from FifoQueue import Fifo

log = logging.getLogger(__name__)

class Session(object):
    def _notifyFlow(self, tapId, pulseCount):
        self._lastActivityTime = datetime.datetime.utcnow()

    def __init__(self, user, kegIO, sessionTimeout, inactivityTimeout):
        self.user = user
        self._kegIO = kegIO
        kegIO += self._notifyFlow
        kegIO.setShutoffValve(1)
        kegIO.resetFlowCount()
        self.tapsCounters = None
        self.sessionTime = datetime.datetime.utcnow()
        self._endSessionTime = datetime.datetime.utcnow() + datetime.timedelta(seconds=sessionTimeout.value)
        self._lastActivityTime = datetime.datetime.utcnow()
        self._inactivityTimeout = datetime.timedelta(seconds=inactivityTimeout.value)

    def _end(self):
        self._kegIO -= self._notifyFlow
        # Turn off the beer
        self._kegIO.setShutoffValve(0)
        # Snapshot our flow sensors
        self.tapsCounters = self._kegIO.getTapsFlowCount()

    @property
    def expired(self):
        now = datetime.datetime.utcnow()
        return self._endSessionTime < now or self._lastActivityTime + self._inactivityTimeout < now

class SessionManager(object):
    def __init__(self, proxReader, kegIO, apiClient, sessionTimeout, inactivityTimeout):
        self._proxReader = proxReader
        self._kegIO = kegIO
        self._apiClient = apiClient
        self._sessionTimeout = sessionTimeout
        self._inactivityTimeout = inactivityTimeout
        self._pendingSessions = Fifo()
        self._currentSession = None
        self._sendMaxRetries = 3

    def _endCurrentSession(self):
        if self._currentSession != None:
            self._currentSession._end()
            self._proxReader.endSession()
            self._pendingSessions.enqueue(self._currentSession)
            log.info('Session ended for %d:%s. Tap amounts: [%s]', 
                self._currentSession.user.personnelId, 
                self._currentSession.user.fullName,
                str({tapId:'{0} pulses, {1} ml'.format(self._currentSession.tapsCounters[tapId].pulseCount, self._currentSession.tapsCounters[tapId].volume) for tapId in self._currentSession.tapsCounters}))
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
        pendingSession = self._pendingSessions.peek()
        if pendingSession != None:
            # Check if we've exceeded the max number of retries for this item
            if self._pendingSessions.peekAttempts > self._sendMaxRetries:
                log.warning('Session for user %d:%s at time: %s has exceeded maximum retries. This session will continue to be retried but will be moved to the tail of the queue',
                    pendingSession.user.personnelId, pendingSession.user.fullName, pendingSession.sessionTime.isoformat())
                self._pendingSessions.dequeue()
                self._pendingSessions.enqueue(pendingSession)
            else:
                if self._apiClient.sendSessionDetails(pendingSession.user, pendingSession.sessionTime, pendingSession.tapsCounters):
                    self._pendingSessions.dequeue()
        return cardId

    def startSession(self, user):
        self._endCurrentSession()
        self._currentSession = Session(user, self._kegIO, self._sessionTimeout, self._inactivityTimeout)
        self._proxReader.startSession()
