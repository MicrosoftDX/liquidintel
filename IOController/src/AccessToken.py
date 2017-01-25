
import datetime
import requests
from purl import URL

class AccessToken(object):
    def __init__(self, tenant, clientId, clientSecret, endpointBase = 'https://login.microsoftonline.com/'):
        self.tenant = tenant
        self.clientId = clientId
        self.clientSecret = clientSecret
        self.tokenUri = URL(endpointBase).add_path_segment(tenant).add_path_segment('oauth2').add_path_segment('token').as_string()
        self._tokens = {}

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
            if not self._tokens.has_key(resource) or self._tokens[resource].isExpired:
                authReq = requests.post(self.tokenUri, data={'grant_type':'client_credentials', 'client_id':self.clientId, 'client_secret':self.clientSecret, 'resource':resource})
                authReq.raise_for_status()
                self._tokens[resource] = AccessToken._Token(authReq.json()['access_token'], long(authReq.json()['expires_on']))

            return 'Bearer {0}'.format(self._tokens[resource].accessToken)
        except:
            return ''
