#
# Module for encapsulating the Microsoft Graph API
#

import urllib, logging
from AccessToken import AccessToken
from NotifyVariable import NotifyVariable
import requests
from purl import URL

log = logging.getLogger(__name__)

class GroupMembership(object):
    _groupIds = []    
    
    def _updateGroupIds(self, groupNamesVariable):
        try:
            # Get the ids of each of the specified groups
            groupsPredicate = '+or+'.join(["displayName+eq+'{0}'".format(urllib.quote(group)) for group in groupNamesVariable.value])
            groupIdsUri = URL(self.apiEndPoint.value).add_path_segment('groups')
            # We have to avoid purl screwing with our query param names = $filter & $select end up being encoded
            params = groupIdsUri.query_params()
            params.update({'$filter': groupsPredicate, '$select': 'id'})
            groupIdsUri = groupIdsUri.query('&'.join(['{0}={1}'.format(k, params[k]) for k in params]))
            groupIdsReq = requests.get(groupIdsUri.as_string(), headers={'Authorization': self._token.getToken(self._tokenResource.value)})
            groupIdsReq.raise_for_status()
            self._groupIds = [group['id'] for group in groupIdsReq.json()['value']]
            log.info('Group ids retrieved from GraphAPI. Details: [%s]', ','.join(["{0}:{1}".format(name, id) for name,id in zip(groupsNameVaraible.value, self._groupIds)]))
        except:
            log.warning('Failed to lookup group ids from GraphAPI. Group names: %s', groupNamesVariable.value, exc_info=1)

    # Note that all parameters (except accessToken) are of type NotifyVariable, so that we can update when config changes
    def __init__(self, groups, accessToken, apiEndPoint = NotifyVariable('https://graph.microsoft.com/v1.0/'), tokenResource = NotifyVariable(AccessToken.RESOURCE_GRAPHAPI)):
        self.apiEndPoint = apiEndPoint
        self._token = accessToken
        self._tokenResource = tokenResource

        groups += self._updateGroupIds
        self._updateGroupIds(groups)

    def isUserMember(self, user):
        if not user:
            return False
        try:
            log.info('Looking up group membership for user: %s', user)
            userMemberUri = URL(self.apiEndPoint.value).add_path_segment('users').add_path_segment(user).add_path_segment('checkMemberGroups')
            userMemberReq = requests.post(userMemberUri.as_string(), json={'groupIds': self._groupIds}, headers={'Authorization': self._token.getToken(self._tokenResource.value)})
            userMemberReq.raise_for_status()
            memberGroups = userMemberReq.json()['value']
            return memberGroups.count() > 0
        except:
            log.warning('Failed to lookup group membership for user: %s', user, exc_info=1)

        return False

