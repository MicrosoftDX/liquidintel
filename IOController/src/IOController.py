#! /bin/python
#
# Main module for reading card & controlling IO 
#

import sys, argparse, time, datetime
from ConfigParserEx import ConfigParserEx
from pcProx import PCProx
from DXLiquidIntelApi import DXLiquidIntelApi
from User import User
from AccessToken import AccessToken
from GroupMembership import GroupMembership
from KegIO import Kegerator
from BeerSession import Session

argsparser = argparse.ArgumentParser()
argsparser.add_argument('-c', '--config', default='./IOController.cfg')
args = argsparser.parse_args()

config = ConfigParserEx({'tenant':'microsoft.com', 'apiEndpoint':'https://dxliquidintel.azurewebsites.net', 'sessionTimeout':'30'})
config.add_section('General')
config.add_section('Authentication')
config.add_section('DXLiquidIntelApi')
config.add_section('Kegerator')
config.read(args.config)

seenUsers = {}
tenant = config.get('Authentication', 'tenant')
sessionTimeout = config.getint('General', 'sessionTimeout')
newCardId = None
prox = PCProx()
accessToken = AccessToken(tenant=tenant, clientId=config.get('Authentication', 'clientId'), clientSecret=config.get('Authentication', 'clientSecret'))
liquidApi = DXLiquidIntelApi(tenant=tenant, apiEndPoint=config.get('DXLiquidIntelApi', 'BaseUri'), accessToken=accessToken)
groupMembership = GroupMembership(groups=config.get_list('General', 'accessGroups'), accessToken=accessToken)
kegIO = Kegerator([Kegerator.TapConfig(config.get(tapSection, 'id'), config.getint(tapSection, 'shutoffPin'), config.getint(tapSection, 'flowPin')) for tapSection in config.get_list('Kegerator', 'tapSections')])
while True:
    if newCardId:
        cardId = newCardId
        newCardId = None
    else:
        cardId = prox.readCard()
    if cardId:
        # Check our user cache
        if seenUsers.has_key(cardId) and not seenUsers[cardId].isExpired:
            user = seenUsers[cardId]
        else:
            userId = liquidApi.getUserForCardId(cardId)
            user = User(userId, cardId, groupMembership.isUserMember(userId))
            seenUsers[cardId] = user
        # Start session if the user is allowed
        if user.allowAccess:
            session = BeerSession(user, prox, sessionTimeout)
            newCardId = session.run()
        else:
            prox.beepFail()
            print user.alias + ' is NOT a permitted user'



