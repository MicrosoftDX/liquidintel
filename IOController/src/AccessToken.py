
import sys, datetime, logging
import requests
from NotifyVariable import NotifyVariable
from purl import URL

log = logging.getLogger(__name__)

class AccessToken(object):
    
    RESOURCE_DXLIQUIDAPI    = 'http://dxliquidintel'
    RESOURCE_GRAPHAPI       = 'https://graph.microsoft.com'
    
    def _clearCache(self, variable):
        # Invalidate cache of tokens as a consequence of configuration changing
        # All subsequent token requests will refetch tokens using the new configuration
        log.debug('Clearing all access tokens in cache.')
        self._tokens.clear()
        self.tokenUri = URL(self._endpointBase.value).add_path_segment(self._tenant.value).add_path_segment('oauth2').add_path_segment('token').as_string()

    # Note: All arguments are of type NotifyVariable which we can be notified when configuration changes
    def __init__(self, tenant, clientId, clientSecret, endpointBase = NotifyVariable('https://login.microsoftonline.com/')):
        log.info('Initializing access token cache.')
        self._tenant = tenant
        self._tenant += self._clearCache
        self._clientId = clientId
        self._clientId += self._clearCache
        self._clientSecret = clientSecret
        self._clientSecret += self._clearCache
        self._endpointBase = endpointBase
        self._endpointBase += self._clearCache
        self._tokens = {}
        self._clearCache(None)

    class _Token(object):
        def __init__(self, accessToken, expirySecs):
            self.accessToken = accessToken
            self.expiry = datetime.datetime.utcfromtimestamp(expirySecs) - datetime.timedelta(minutes=1)

        @property
        def isExpired(self):
            return self.expiry < datetime.datetime.utcnow()

    def getToken(self, resource):
        resource = resource.lower()

        try:
            # If we don't have a token cached or it has expired, then request a new token
            if not resource in self._tokens or self._tokens[resource].isExpired:
                log.debug('Acquiring access token for resource: %s', resource)
                authReq = requests.post(self.tokenUri, data={'grant_type': 'client_credentials', 'client_id': self._clientId.value, 'client_secret': self._clientSecret.value, 'resource': resource})
                authReq.raise_for_status()
                authResp = authReq.json()
                log.debug('Auth token, resource: %s, expiry: %s token: %s', resource, authResp['expires_on'], authResp['access_token'])
                self._tokens[resource] = AccessToken._Token(authResp['access_token'], long(authResp['expires_on']))

            return 'Bearer {0}'.format(self._tokens[resource].accessToken)
        except:
            log.warning('Failed to acquire token for resource: %s. ', resource, exc_info=1)
            return ''
