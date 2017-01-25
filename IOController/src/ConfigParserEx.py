
import json
from ConfigParser import SafeConfigParser

class ConfigParserEx(SafeConfigParser):

    def get_list(self, section, option):
        values = SafeConfigParser.get(self, section, option)
        return json.loads(values)

