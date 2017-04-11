#
# Module for encapsulating reading of pcProx card
#
import sys
from ctypes import *

class PCProx(object):
    if sys.platform != 'win32':

        def __init__(self):
            self._hid = CDLL('../bin/libhidapi-hidraw.so')
            self._pcProx = CDLL('../bin/libpcProxAPI.so')
            self._pcProx._Z10usbConnectv()
            self._buffer = (c_ubyte * 40)()

        def readCard(self):
            cardId = 0
            bitCount = self._pcProx._Z11GetActiveIDPhs(self._buffer, len(self._buffer))
            if (bitCount > 0):
                    bytes = (bitCount+7)/8
                    cardId = 0
                    for i in range(0, bytes):
                        cardId += c_ubyte(self._buffer[i]).value << (i * 8)
            return cardId

        def beepFail(self):
            self._pcProx._Z7BeepNowhs(2,1)

        def beepEndSession(self):
            self._pcProx._Z7BeepNowhs(0,0)

        def startSession(self):
            # Turn on the green LED for the duration of the session
            self._pcProx._Z23setLEDCtrl_bAppCtrlsLEDs(1)
            self._pcProx._Z20setLEDCtrl_bVolatiles(1)
            self._pcProx._Z23setLEDCtrl_iRedLEDStates(0)
            self._pcProx._Z23setLEDCtrl_iGrnLEDStates(1)

        def endSession(self):
            # Return LED control back to automatic & beep the end of the session
            self._pcProx._Z23setLEDCtrl_bAppCtrlsLEDs(0)
            self.beepEndSession()
            return 0
            
    else:
        def __init__(self):
            self.counter = 0

        def readCard(self):
            self.counter += 1
            return [1801958, 0, 0, 55, 0, 0, 1958144, 0, 0, 0, 0][self.counter % 11]

        def beepFail(self):
            # No-op
            return 0

        def beepEndSession(self):
            # No-op
            return 0

        def startSession(self):
            # No-op
            return 0

        def endSession(self):
            # No-op
            return 0
            
