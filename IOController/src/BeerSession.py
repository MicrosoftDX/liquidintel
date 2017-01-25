
import datetime, time
import pcProx, KegIO, User

class Session(object):
    def __init__(self, user, proxReader, sessionTimeout):
        self.user = user
        self._proxReader = proxReader
        self.sessionTimeout = sessionTimeout

    def _terminateSession(self):
        # Write session information to IOT Hubs
        self._proxReader.beepEndSession()

    def run(self):
        endSessionTime = datetime.datetime.utcnow() + datetime.timedelta(seconds=self.sessionTimeout)
        while datetime.datetime.utcnow() < endSessionTime:
            # If someone else swipes a card, this session will terminate
            cardId = self._proxReader.readCard()
            if cardId:
                self._terminateSession()
                return cardId
            time.sleep(1)

        self._terminateSession()
        return None
