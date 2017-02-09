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

    else:
        def __init__(self):
            self.counter = 0

        def readCard(self):
            self.counter += 1
            return [1801958, 55, 1958144][self.counter % 3]

        def beepFail(self):
            # No-op
            return 0

        def beepEndSession(self):
            # No-op
            return 0
            
