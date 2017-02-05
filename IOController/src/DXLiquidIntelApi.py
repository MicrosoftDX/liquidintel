#
# Module for encapsulating the DXLiquidIntel API 
#

import logging
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
        try:
            userAuthUri = URL(self.apiEndPoint.value).add_path_segment('api').add_path_segment('ispersonvalid').add_path_segment(str(cardId))
            userReq = requests.get(userAuthUri.as_string(), auth=HTTPBasicAuth(self._apiUser.value, self._apiKey.value))
            userReq.raise_for_status()
            json = userReq.json()
            if isinstance(json, list):
                json = json[0]
            validUser = json.get('Valid', False)
            personnelId = int(json.get('PersonnelNumber', 0))
            return (validUser, personnelId)
        except:
            log.warning('Failed to check user validity. User card id: %d', cardId, exc_info=1)
            return (None, None)
            
    def getUserForCardId(self, cardId):
        accessToken = None
        if accessToken:
            getUserUri = URL(self.apiEndPoint.value).add_path_segment('api').add_path_segment('getpersonbycardid').add_path_segment(str(cardId))
            userReq = requests.get(getUserUri.as_string(), headers={'Authorization':accessToken})
            try:
                userReq.raise_for_status()
                json = userReq.json()
                emailName = json.get('EmailName', '')
                personnelId = int(json.get('PersonnelNumber', 0))
                return (personnelId, '{0}@{1}'.format(emailName, self.tenant.value))
            except:
                log.warning('Failed to decode getpersonbycardid response: %s', userReq.content, exc_info=1)
                return (None, None)
                
        return (None, None)
