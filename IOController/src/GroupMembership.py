#
# Module for encapsulating the Microsoft Graph API
#

import urllib
from AccessToken import AccessToken
import requests
from purl import URL

class GroupMembership(object):
    def __init__(self, groups, accessToken, apiEndPoint = 'https://graph.microsoft.com/v1.0/', tokenResource = AccessToken.RESOURCE_GRAPHAPI):
        self.apiEndPoint = apiEndPoint
        self._token = accessToken
        self._tokenResource = tokenResource

        # Get the ids of each of the specified groups
        self._groupIds = []
        groupsPredicate = '+or+'.join(["displayName+eq+'{0}'".format(urllib.quote(group)) for group in groups])
        groupIdsUri = URL(self.apiEndPoint).add_path_segment('groups')
        # We have to avoid purl screwing with our query param names = $filter & $select end up being encoded
        params = groupIdsUri.query_params()
        params.update({'$filter': groupsPredicate, '$select': 'id'})
        groupIdsUri = groupIdsUri.query('&'.join(['{0}={1}'.format(k, params[k]) for k in params]))
        groupIdsReq = requests.get(groupIdsUri.as_string(), headers={'Authorization': self._token.getToken(self._tokenResource)})
        if groupIdsReq.ok:
            self._groupIds = [group['id'] for group in groupIdsReq.json()['value']]

    def isUserMember(self, user):
        if not user:
            return False
        userMemberUri = URL(self.apiEndPoint).add_path_segment('users').add_path_segment(user).add_path_segment('checkMemberGroups')
        userMemberReq = requests.post(userMemberUri.as_string(), json={'groupIds':self._groupIds}, headers={'Authorization': self._token.getToken(self._tokenResource)})
        if userMemberReq.ok:
            memberGroups = userMemberReq.json()['value']
            return memberGroups.count() > 0
        return False

