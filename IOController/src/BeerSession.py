
import datetime, time, logging
import pcProx, KegIO, User

log = logging.getLogger(__name__)

class Session(object):
    def __init__(self, user, proxReader, kegIO, apiClient, sessionTimeout):
        self.user = user
        self._proxReader = proxReader
        self._kegIO = kegIO
        self._apiClient = apiClient
        self.sessionTimeout = sessionTimeout

    def _terminateSession(self):
        self._proxReader.beepEndSession()
        # Write session information to IOT Hubs
        try:
            self._apiClient.sendSessionDetails(self.user, self._kegIO)
        except:
            log.warning('Failed to write session details to service. User: %s', self.user.alias, exc_info=1)

    def run(self):
        endSessionTime = datetime.datetime.utcnow() + datetime.timedelta(seconds=self.sessionTimeout.value)
        log.info('Running beer session for user: %s, end time: %s', self.user.fullName, endSessionTime)
        while datetime.datetime.utcnow() < endSessionTime:
            # If someone else swipes a card, this session will terminate
            cardId = self._proxReader.readCard()
            if cardId != 0:
                self._terminateSession()
                return cardId
            time.sleep(1)

        self._terminateSession()
        return 0
