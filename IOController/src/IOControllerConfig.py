
import json
from ConfigParser import SafeConfigParser
from NotifyVariable import NotifyVariable
from KegIO import Kegerator

class IOControllerConfig(object):

    # The set of configuration attributes
    tenant = NotifyVariable('')
    sessionTimeout = NotifyVariable(0)
    clientId = NotifyVariable('')
    clientSecret = NotifyVariable('')
    apiBaseUri = NotifyVariable('')
    accessGroupNames = NotifyVariable([])
    tapsConfig = NotifyVariable(None)
    iotHubConnectString = NotifyVariable('')

    # Section names in the config file
    SECTION_AUTHENTICATION = 'Authentication'
    SECTION_GENERAL = 'General'
    SECTION_LIQUIDAPI = 'DXLiquidIntelApi'
    SECTION_KEGERATOR = 'Kegerator'

    # Wrappers from 2 different configuration sources - ConfigParser & IoT Twin (json)
    class _dictWrapperSource(object):
        def __init__(self, dict):
            self._dict = dict

        def get(self, section, option, default = ''):
            return self._dict.get(option, default)

        def getint(self, section, option, default = 0):
            value = self._dict.get(option, None)
            if value:
                return int(value)
            return default

        def getlist(self, section, option, default):
            values = self._dict.get(option, None)
            if values:
                return json.loads(values)
            return default

    class _configParserWrapperSource(object):
        def __init__(self, configParser):
            self._configParser = configParser

        def _get(self, section, option, default, conv):
            value = self._configParser.get(section, option)
            if value:
                return conv(value)
            return default

        def get(self, section, option, default = ''):
            return self._get(section, option, default, str)

        def getint(self, section, option, default = 0):
            return self._get(section, option, default, int)

        def getlist(self, section, option, default):
            return self._get(section, option, default, json.loads)

    def _refreshConfigFromSource(self, configSource):
        self.tenant.value = configSource.get(IOControllerConfig.SECTION_AUTHENTICATION, 'tenant', self.tenant.value)
        self.sessionTimeout.value = configSource.getint(IOControllerConfig.SECTION_GENERAL, 'sessionTimeout', self.sessionTimeout.value)
        self.clientId.value = configSource.get(IOControllerConfig.SECTION_AUTHENTICATION, 'clientId', self.clientId.value)
        self.clientSecret.value = configSource.get(IOControllerConfig.SECTION_AUTHENTICATION, 'clientSecret', self.clientSecret.value)
        self.apiBaseUri.value = configSource.get(IOControllerConfig.SECTION_LIQUIDAPI, 'BaseUri', self.apiBaseUri.value)
        self.accessGroupNames.value = configSource.getlist(IOControllerConfig.SECTION_GENERAL, 'accessGroups', self.accessGroupNames.value)
        if configSource.get(IOControllerConfig.SECTION_KEGERATOR, 'tapSections', None):
            self.tapsConfig.value = [Kegerator.TapConfig(configSource.get(tapSection, 'id'), configSource.getint(tapSection, 'shutoffPin'), configSource.getint(tapSection, 'flowPin')) for tapSection in configSource.getlist(IOControllerConfig.SECTION_KEGERATOR, 'tapSections', None)]
        self.iotHubConnectString.value = configSource.get(IOControllerConfig.SECTION_GENERAL, 'iotHubConnectString', self.iotHubConnectString.value)

    def __init__(self, configFile):
        # Read the static config from the config file
        config = SafeConfigParser({'tenant':'microsoft.com', 'apiEndpoint':'https://dxliquidintel.azurewebsites.net', 'sessionTimeout':'30'})
        config.add_section(IOControllerConfig.SECTION_GENERAL)
        config.add_section(IOControllerConfig.SECTION_AUTHENTICATION)
        config.add_section(IOControllerConfig.SECTION_LIQUIDAPI)
        config.add_section(IOControllerConfig.SECTION_KEGERATOR)
        config.read(configFile)

        self._refreshConfigFromSource(IOControllerConfig._configParserWrapperSource(config))

    def refreshFromTwin(self, twinConfig):
        # Update ANY configuration being pushed down from IoT Hub
        self._refreshConfigFromSource(IOControllerConfig._dictWrapperSource(twinConfig))
        

        