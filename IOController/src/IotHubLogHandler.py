
import logging
from IOTHubs import IOTHub

class IotHubLogHandler(logging.Handler):

    _iotClient = None

    def __init__(self, iotClient = None, level = logging.NOTSET):
        logging.Handler.__init__(self, level)
        self._iotClient = iotClient

    def setIotClient(self, iotClient):
        self._iotClient = iotClient

    def emit(self, record):
        try:
            # Dump all messages out to IoT Hub - the configured Level will do our filtering
            if self._iotClient:
                self._iotClient.sendLogMessage(self.format(record), record.levelname)
        except:
            self.handleError(record)