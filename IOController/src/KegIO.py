
import sys
from gpiozero import *

class Kegerator(object):

    class TapConfig(object):
        def __init__(self, tapId, shutoffValvePin, flowSensorPin):
            self.tapId = tapId
            self.shutoffValvePin = shutoffValvePin
            self.flowSensorPin = flowSensorPin

    class _TapDevice(object):
        def _countEdge(self, raising):
            if raising:
                self.pulseCount += 1

        if sys.platform != 'win32':
            def initializeGpio(self):
                self.shutoffValve = DigitalOutputDevice(tapConfig.shutoffValvePin)
                self.flowSensor = DigitalInputDevice(tapConfig.flowSensorPin)
                self.flowSensor.when_activated = lambda: self._countEdge(1)
                self.flowSensor.when_deactivated = lambda: self._countEdge(0)

            def closeGpio(self):
                self.shutoffValve.close()
                self.flowSensor.close()

        else:
            def initializeGpio(self):
                # Do nothing on Windows
                self.pulseCount = 0
            
            def closeGpio(self):
                # No-op on Windows
                return 0

        def __init__(self, tapConfig):
            self.tapId = tapConfig.tapId
            self.pulseCount = 0
            self.initializeGpio()

        def close(self):
            self.closeGpio()

        def resetPulseCount(self):
            self.pulseCount = 0

    def _initializeTapsDevices(self, tapsConfigVariable):
        if self._tapsDevices:
            for tap in self._tapsDevices:
                tap.close()
        # Constructing TapDevice will also initialize Gpio
        self._tapsDevices = [Kegerator._TapDevice(config) for config in tapsConfigVariable.value]
        
    def __init__(self, tapsConfig):
        self._tapsConfig = tapsConfig
        self._tapsConfig += self._initializeTapsDevices
        self._tapsDevices = []
        self._initializeTapsDevices(self._tapsConfig)

    def resetFlowCount(self):
        for tap in self._tapsDevices:
            tap.resetPulseCount()

    def getTapsFlowCount(self):
        return {tap.tapId:tap.pulseCount for tap in self._tapsDevices}
