
import json
from ConfigParser import SafeConfigParser
from NotifyVariable import NotifyVariable
from KegIO import Kegerator

class IOControllerConfig(object):

    # The set of configuration attributes
    sessionTimeout = NotifyVariable(0)
    apiBaseUri = NotifyVariable('')
    apiUser = NotifyVariable('')
    apiKey = NotifyVariable('')
    tapsConfig = NotifyVariable(None)
    iotHubConnectString = NotifyVariable('')
    installDir = NotifyVariable('')

    # Section names in the config file
    SECTION_GENERAL = 'General'
    SECTION_LIQUIDAPI = 'DXLiquidIntelApi'
    SECTION_KEGERATOR = 'Kegerator'

    # Wrappers from 2 different configuration sources - ConfigParser & IoT Twin (json)
    class _dictWrapperSource(object):
        def __init__(self, dict):
            self._dict = dict

        def _get(self, object, attribute, default, conv):
            obj = self._dict.get(object, None)
            if obj:
                if attribute in obj:
                    if conv:
                        return conv(obj[attribute])
                    else:
                        return obj[attribute]
            return default

        def get(self, object, attribute, default = ''):
            return self._get(object, attribute, default, str)

        def getint(self, object, attribute, default = 0):
            return self._get(object, attribute, default, int)

        def getlist(self, object, attribute, default):
            # We have to encode lists differently as IoT Hub properties do not support arrays.
            # Instead, all attributes in the sub object will be considered list entries and
            # the attribute name will be ignored.
            value = self._get(object, attribute, '', None)
            if not value:
                return default
            return [value[key] for key in value if value[key]]

    class _configParserWrapperSource(object):
        def __init__(self, configParser):
            self._configParser = configParser

        def _get(self, section, option, default, conv):
            if self._configParser.has_option(section, option):
                return conv(self._configParser.get(section, option))
            return default

        def get(self, section, option, default = ''):
            return self._get(section, option, default, str)

        def set(self, section, option, value):
            # Setters are no-ops for this source
            return 0

        def getint(self, section, option, default = 0):
            return self._get(section, option, default, int)

        def setint(self, section, option, value):
            # Setters are no-ops for this source
            return 0

        def getlist(self, section, option, default):
            # We have a special-case semantic here. If there's an entry
            # in the specified section, called option + 'Sections', then
            # we dereference each section (all attributes) as an array
            # of objects.
            sections = self._get(section, option + 'Sections', None, json.loads)
            if sections:
                # Only support 1 level of indirection
                return [{attribName:value for attribName,value in self._configParser.items(section)} for section in sections]
            return self._get(section, option, default, json.loads)

        def setlist(self, section, option, values):
            # Setters are no-ops for this source
            return 0

    def _refreshConfigFromSource(self, configSource):
        self.sessionTimeout.value = configSource.getint(IOControllerConfig.SECTION_GENERAL, 'sessionTimeout', self.sessionTimeout.value)
        self.apiBaseUri.value = configSource.get(IOControllerConfig.SECTION_LIQUIDAPI, 'apiEndpoint', self.apiBaseUri.value)
        self.apiUser.value = configSource.get(IOControllerConfig.SECTION_LIQUIDAPI, 'apiUser', self.apiUser.value)
        self.apiKey.value = configSource.get(IOControllerConfig.SECTION_LIQUIDAPI, 'apiKey', self.apiKey.value)
        self.tapsConfig.value = [Kegerator.TapConfig(tap['id'], tap['shutoffpin'], tap['flowpin']) if isinstance(tap, dict) else tap for tap in configSource.getlist(IOControllerConfig.SECTION_KEGERATOR, 'taps', self.tapsConfig.value)]
        self.iotHubConnectString.value = configSource.get(IOControllerConfig.SECTION_GENERAL, 'iotHubConnectString', self.iotHubConnectString.value)
        self.installDir.value = configSource.get(IOControllerConfig.SECTION_GENERAL, 'installDir', self.installDir.value)

    def __init__(self, configFiles):
        # Read the static config from the config file
        config = SafeConfigParser({'apiEndpoint':'https://dxliquidintel.azurewebsites.net/api', 'sessionTimeout':'30'})
        config.add_section(IOControllerConfig.SECTION_GENERAL)
        config.add_section(IOControllerConfig.SECTION_LIQUIDAPI)
        config.add_section(IOControllerConfig.SECTION_KEGERATOR)
        config.read(configFiles)

        self._refreshConfigFromSource(IOControllerConfig._configParserWrapperSource(config))

    def refreshFromTwin(self, twinConfig):
        # Update ANY configuration being pushed down from IoT Hub
        self._refreshConfigFromSource(IOControllerConfig._dictWrapperSource(twinConfig))
        

        
