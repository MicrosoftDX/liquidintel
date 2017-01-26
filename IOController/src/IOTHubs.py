
from iothub_client import *

class IOTHub(object):

    def _deviceMethodCallback(methodName, payload, context):
        print(
            "\nMethod callback called with:\nmethodName = %s\npayload = %s\ncontext = %s" % 
            (methodName, payload, context))
        deviceMethodReturnValue = DeviceMethodReturnValue()
        deviceMethodReturnValue.response = "{ \"Response\": \"This is the response from the device\" }"
        deviceMethodReturnValue.status = 200
        return deviceMethodReturnValue

    def __init__(self, connectString):
        self._iotHubClient = IoTHubClient(connectString, IoTHubTransportProvider.MQTT)
        self._iotHubClient.set_option("messageTimeout", 100000)
        self._iotHubClient.set_option("logtrace", 0)
        self._iotHubClient.set_message_callback(_receiveMessageCallback, 0) 
        self._iotHubClient.set_device_twin_callback(_deviceTwinCallback, 0)
        self._iotHubClient.set_device_method_callback(_deviceMethodCallback, 0)