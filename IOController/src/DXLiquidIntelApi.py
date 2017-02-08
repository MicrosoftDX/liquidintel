#
# Module for encapsulating the DXLiquidIntel API 
#

import logging, time, datetime
from NotifyVariable import NotifyVariable
import requests
from requests.exceptions import HTTPError
from requests.auth import HTTPBasicAuth
from requests.status_codes import codes
from functools import partial
from purl import URL

log = logging.getLogger(__name__)

class DXLiquidIntelApi(object):
    # Note that all arguments (with exception of accessToken) are of type NotifyVariable, so that we can update when config changes
    def __init__(self, apiEndPoint, apiUser, apiKey, requestTimeout):
        self.apiEndPoint = apiEndPoint
        self._apiUser = apiUser
        self._apiKey = apiKey
        self._requestTimeout = requestTimeout

    def _retryWrapper(self, failureMessage, failResult, operation):
        retries = 3
        while retries > 0:
            try:
                return operation(self._requestTimeout.value)
            except HTTPError as ex:
                if ex.response.status_code == codes.not_found:
                    log.warning('%s. Received NOT_FOUND - abandoning', failureMessage, exc_info=1)
                    return failResult
                log.warning('%s. Retries remaining: %d', failureMessage, retries - 1, exc_info=1)
            except:
                log.warning('%s. Retries remaining: %d', failureMessage, retries - 1, exc_info=1)
            retries -= 1
            time.sleep(3)
        return failResult

    def _isUserAuthenticatedImpl(self, cardId, timeout):
        userAuthUri = URL(self.apiEndPoint.value).add_path_segment('ispersonvalid').add_path_segment(str(cardId))
        userReq = requests.get(userAuthUri.as_string(), auth=HTTPBasicAuth(self._apiUser.value, self._apiKey.value), timeout=timeout)
        userReq.raise_for_status()
        json = userReq.json()
        if isinstance(json, list):
            json = json[0]
        validUser = json.get('Valid', False)
        personnelId = int(json.get('PersonnelNumber', 0))
        fullName = json.get('FullName', '')
        return (validUser, personnelId, fullName)

    def _sendSessionDetails(self, user, tapsCounters, timeout):
        sessionUri = URL(self.apiEndPoint.value).add_path_segment('activity')
        payload = {
            'sessionTime': datetime.datetime.utcnow().isoformat(),
            'personnelNumber':user.personnelId,
            'Taps': {tapId:{'amount':tapsCounters[tapId]} for tapId in tapsCounters}
        }
        userReq = requests.post(sessionUri.as_string(), auth=HTTPBasicAuth(self._apiUser.value, self._apiKey.value), json=payload, timeout=timeout)
        userReq.raise_for_status()
        log.info('Session info for user: %d:%s added with activities: %s', user.personnelId, user.fullName, str([activity['ActivityId'] for activity in userReq.json()]))
        return True

    def isUserAuthenticated(self, cardId):
        return self._retryWrapper('Failed to check user validity. User card id: {0}'.format(cardId), (False, None, None), partial(self._isUserAuthenticatedImpl, cardId))
            
    def sendSessionDetails(self, user, tapsCounters):
        return self._retryWrapper('Failed to write session details to service. User: {0}:{1}'.format(user.personnelId, user.fullName), False, partial(self._sendSessionDetails, user, tapsCounters))