
import sys, logging
from gpiozero import *

log = logging.getLogger(__name__)

class Kegerator(object):

    class TapConfig(object):
        def __init__(self, tapId, shutoffValvePin, flowSensorPin, flowCalibrationFactor):
            self.tapId = tapId
            self.shutoffValvePin = int(shutoffValvePin)
            self.flowSensorPin = int(flowSensorPin)
            self.flowCalibrationFactor = float(flowCalibrationFactor)

        def __eq__(self, other):
            return self.__dict__ == other.__dict__

    class _TapDevice(object):
        def _countEdge(self, raising):
            if raising:
                self.pulseCount += 1

        if sys.platform != 'win32':
            def initializeGpio(self, tapConfig):
                self.shutoffValve = DigitalOutputDevice(tapConfig.shutoffValvePin)
                self.flowSensor = DigitalInputDevice(tapConfig.flowSensorPin)
                self.flowSensor.when_activated = lambda: self._countEdge(1)
                self.flowSensor.when_deactivated = lambda: self._countEdge(0)

            def closeGpio(self):
                self.shutoffValve.close()
                self.flowSensor.close()

        else:
            def initializeGpio(self, tapConfig):
                # Do nothing on Windows
                self.pulseCount = 0
            
            def closeGpio(self):
                # No-op on Windows
                return 0

        def __init__(self, tapConfig):
            self.tapId = tapConfig.tapId
            self.flowCalibrationFactor = tapConfig.flowCalibrationFactor
            self.pulseCount = 0
            self.initializeGpio(tapConfig)

        def close(self):
            self.closeGpio()

        def resetPulseCount(self):
            self.pulseCount = 0

    def _resetTapsDevices(self):
        if self._hwInitialized:
            log.debug('Resetting hardware I/O configuration')
            if self._tapsDevices:
                for tap in self._tapsDevices:
                    tap.close()
            self._hwInitialized = False

    def _initializeTapsDevices(self, tapsConfigVariable):
        log.debug('Initializing hardware I/O configuration')
        self._resetTapsDevices()
        # Constructing TapDevice will also initialize Gpio
        self._tapsDevices = [Kegerator._TapDevice(config) for config in tapsConfigVariable.value]
        self._hwInitialized = True
        
    def __init__(self, tapsConfig):
        self._tapsConfig = tapsConfig
        self._tapsConfig += self._initializeTapsDevices
        self._tapsDevices = []
        self._hwInitialized = False

    def __enter__(self):
        self._initializeTapsDevices(self._tapsConfig)

    def __exit__(self, type, value, traceback):
        self._resetTapsDevices()

    def resetFlowCount(self):
        for tap in self._tapsDevices:
            tap.resetPulseCount()

    def getTapsFlowCount(self):
        return {tap.tapId: type('', (object,), {'pulseCount': tap.pulseCount, 'volume': tap.pulseCount * tap.flowCalibrationFactor}) for tap in self._tapsDevices}
