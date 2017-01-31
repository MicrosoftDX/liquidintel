#
# Module for encapsulating the DXLiquidIntel API 
#

import logging
from AccessToken import AccessToken
from NotifyVariable import NotifyVariable
import requests
from purl import URL

log = logging.getLogger(__name__)

class DXLiquidIntelApi(object):
    # Note that all arguments (with exception of accessToken) are of type NotifyVariable, so that we can update when config changes
    def __init__(self, tenant, apiEndPoint, accessToken, tokenResource = NotifyVariable(AccessToken.RESOURCE_DXLIQUIDAPI)):
        self.tenant = tenant
        self.apiEndPoint = apiEndPoint
        self._token = accessToken
        self._tokenResource = tokenResource

    def getUserForCardId(self, cardId):
        accessToken = self._token.getToken(self._tokenResource.value)
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
