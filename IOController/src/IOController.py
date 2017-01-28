#! /bin/python
#
# Main module for reading card & controlling IO 
#

import sys, argparse, time, datetime, logging
from IOControllerConfig import IOControllerConfig
from pcProx import PCProx
from DXLiquidIntelApi import DXLiquidIntelApi
from User import User
from AccessToken import AccessToken
from GroupMembership import GroupMembership
from KegIO import Kegerator
from BeerSession import Session
from IOTHubs import IOTHub
from IotHubLogHandler import IotHubLogHandler

argsparser = argparse.ArgumentParser()
argsparser.add_argument('-c', '--config', default='./IOController.cfg')
argsparser.add_argument('-l', '--loglevel', default='INFO')
args = argsparser.parse_args()

log = logging.getLogger()
log.setLevel(getattr(logging, args.loglevel.upper()))
# We need a stderr logger
lh = logging.StreamHandler()
lh.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
log.addHandler(lh)
# And our handler to send stuff out to IoT hubs
iotLogHandler = IotHubLogHandler(level=logging.WARNING)
iotLogHandler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))
log.addHandler(iotLogHandler)

config = IOControllerConfig(args.config)

seenUsers = {}
newCardId = None
iotHubClient = IOTHub(config.iotHubConnectString, config)
iotLogHandler.setIotClient(iotHubClient)
prox = PCProx()
accessToken = AccessToken(tenant=config.tenant, clientId=config.clientId, clientSecret=config.clientSecret)
liquidApi = DXLiquidIntelApi(tenant=config.tenant, apiEndPoint=config.apiBaseUri, accessToken=accessToken)
groupMembership = GroupMembership(groups=config.accessGroupNames, accessToken=accessToken)
kegIO = Kegerator(config.tapsConfig)
while True:
    if newCardId:
        cardId = newCardId
        newCardId = None
    else:
        cardId = prox.readCard()
    if cardId:
        log.info('Card: %s has been read from reader', cardId)
        # Check our user cache
        if cardId in seenUsers and not seenUsers[cardId].isExpired:
            user = seenUsers[cardId]
        else:
            (personnelId, userId) = liquidApi.getUserForCardId(cardId)
            log.info('Card: %s is associated with user: %d, %s', cardId, personnelId, userId)
            user = User(personnelId, userId, cardId, groupMembership.isUserMember(userId))
            seenUsers[cardId] = user
        # Start session if the user is allowed
        if user.allowAccess:
            session = BeerSession(user, prox, kegIO, iotHubClient, config.sessionTimeout)
            newCardId = session.run()
        else:
            prox.beepFail()
            log.info('User: %s is NOT a permitted user', user.alias)



