#
# Module for encapsulating the DXLiquidIntel API 
#

from AccessToken import AccessToken
import requests
from purl import URL

class DXLiquidIntelApi(object):
    def __init__(self, tenant, apiEndPoint, accessToken, tokenResource = AccessToken.RESOURCE_DXLIQUIDAPI):
        self.tenant = tenant
        self.apiEndPoint = apiEndPoint
        self._token = accessToken
        self._tokenResource = tokenResource

    def getUserForCardId(self, cardId):
        accessToken = self._token.getToken(self._tokenResource)
        if accessToken:
            getUserUri = URL(self.apiEndPoint).add_path_segment('api').add_path_segment('getpersonbycardid').add_path_segment(cardId)
            userReq = requests.get(getUserUri.as_string(), headers={'Authorization':accessToken})
            if userReq.ok:
                try:
                    emailName = userReq.json()['EmailName']
                    return '{0}@{1}'.format(emailName, self.tenant)
                except:
                    return None

        return None