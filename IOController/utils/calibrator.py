#! /bin/python
#
# Module for calibrating flow sensor. Usage:
#   python calibrator.py {pin #}
#

import sys, datetime, time
from threading import Thread, Event
from gpiozero import *

pulseCount = 0
seenPulse = False
lastPulse = datetime.datetime.utcnow()

def countEdge():
    global seenPulse
    global pulseCount
    global lastPulse
    lastPulse = datetime.datetime.utcnow()
    seenPulse = True
    pulseCount += 1
    print pulseCount

flowSensor = DigitalInputDevice(int(sys.argv[1]))
flowSensor.when_activated = lambda: countEdge()

calibrationRunning = True
while calibrationRunning:
    if seenPulse and datetime.datetime.utcnow() > lastPulse + datetime.timedelta(seconds=10):
        calibrationRunning = False
        print 'Enter volume (ml): '
        volume = float(sys.stdin.readline())
        print 'Volume: {0}, Pulse Count: {1}, Calibration Factor: {2}'.format(volume, pulseCount, volume / pulseCount)
    else:
        time.sleep(.5)




