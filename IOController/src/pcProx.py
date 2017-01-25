#
# Module for encapsulating reading of pcProx card
#
import sys

class PCProx(object):
    if sys.platform != 'win32':
        from ctypes import *

        def __init__(self):
            self._hid = CDLL('hidapi/libhidapi-hidraw.so')
            self._pcProx = CDLL('pcProxAPI/libpcProxAPI.so')
            self._pcProx._Z10usbConnectv()
            self._buffer = (c_ubyte * 40)()

        def readCard(self):
            cardId = 0
            bitCount = self._pcProx._Z11GetActiveIDPhs(buf, 40)
            if (bitCount > 0):
                    bytes = (bitCount+7)/8
                    cardId = 0
                    for i in range(0, bytes):
                        cardId += c_ubyte(buf[i]).value << (i * 8)
            return str(cardId)

        def beepFail(self):
            self._pcProx._Z7BeepNowhs(2,1)

        def beepEndSession(self):
            self._pcProx._Z7BeepNowhw(0,0)

    else:
        def readCard(self):
            return '1801958'

        def beepFail(self):
            # No-op
            return 0

        def beepEndSession(self):
            # No-op
            return 0
            
