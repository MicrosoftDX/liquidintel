#
# Module for encapsulating the DXLiquidIntel API 
#

import logging, time
from NotifyVariable import NotifyVariable
import requests
from requests.auth import HTTPBasicAuth
from purl import URL

log = logging.getLogger(__name__)

class DXLiquidIntelApi(object):
    # Note that all arguments (with exception of accessToken) are of type NotifyVariable, so that we can update when config changes
    def __init__(self, apiEndPoint, apiUser, apiKey):
        self.apiEndPoint = apiEndPoint
        self._apiUser = apiUser
        self._apiKey = apiKey

    def isUserAuthenticated(self, cardId):
        retries = 3
        while retries > 0:
            try:
                userAuthUri = URL(self.apiEndPoint.value).add_path_segment('ispersonvalid').add_path_segment(str(cardId))
                userReq = requests.get(userAuthUri.as_string(), auth=HTTPBasicAuth(self._apiUser.value, self._apiKey.value))
                userReq.raise_for_status()
                json = userReq.json()
                if isinstance(json, list):
                    json = json[0]
                validUser = json.get('Valid', False)
                personnelId = int(json.get('PersonnelNumber', 0))
                fullName = json.get('FullName', '')
                return (validUser, personnelId, fullName)
            except:
                log.warning('Failed to check user validity. User card id: %d. Retries remaining: %d', cardId, retries - 1, exc_info=1)
            retries -= 1
            time.sleep(3)
        return (None, None, None)
            
    def sendSessionDetails(self, user, kegIO):
        return 0