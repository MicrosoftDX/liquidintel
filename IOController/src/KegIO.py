
import sys, logging
from threading import Thread, Event
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
                for handler in self._flowHandlers:
                    handler(self.tapId, self.pulseCount)

        if sys.platform != 'win32':
            def initializeGpio(self, tapConfig):
                self.shutoffValve = DigitalOutputDevice(tapConfig.shutoffValvePin)
                self.flowSensor = DigitalInputDevice(tapConfig.flowSensorPin)
                self.flowSensor.when_activated = lambda: self._countEdge(1)

            def closeGpio(self):
                self.shutoffValve.close()
                self.flowSensor.close()

            def setShutoffValve(self, turnOn):
                self.shutoffValve.value = turnOn

        else:
            class WinEmulatePulse(Thread):
                def __init__(self, event, handler):
                    Thread.__init__(self)
                    self._event = event
                    self._handler = handler

                def run(self):
                    while not self._event.wait(0.1):
                        self._handler(1)

            def initializeGpio(self, tapConfig):
                # Emulate pulses with a background thread
                self._stopEvent = Event()
                Kegerator._TapDevice.WinEmulatePulse(self._stopEvent, self._countEdge).start()
                self.pulseCount = 0
            
            def closeGpio(self):
                # Signal the pulse emulator to StopIteration
                self._stopEvent.set()
                return 0

        def setShutoffValve(self, turnOn):
            # No-op on windows
            return 0

        def __init__(self, tapConfig):
            self.tapId = tapConfig.tapId
            self.flowCalibrationFactor = tapConfig.flowCalibrationFactor
            self.pulseCount = 0
            self._flowHandlers = []
            self.initializeGpio(tapConfig)

        def close(self):
            self.closeGpio()

        def resetPulseCount(self):
            self.pulseCount = 0

        def addFlowSensorHandler(self, handler):
            self._flowHandlers.append(handler)

        def removeFlowSensorHandler(self, handler):
            self._flowHandlers.remove(handler)

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

    def __iadd__(self, handler):
        # Allows callers to register for flow sensor pulse notifications
        for tap in self._tapsDevices:
            tap.addFlowSensorHandler(handler)
        return self

    def __isub__(self, handler):
        for tap in self._tapsDevices:
            tap.removeFlowSensorHandler(handler)
        return self

    def resetFlowCount(self):
        for tap in self._tapsDevices:
            tap.resetPulseCount()

    def setShutoffValve(self, turnOn):
        for tap in self._tapsDevices:
            tap.setShutoffValve(turnOn)

    def getTapsFlowCount(self):
        return {tap.tapId: type('', (object,), {'pulseCount': tap.pulseCount, 'volume': tap.pulseCount * tap.flowCalibrationFactor}) for tap in self._tapsDevices}
