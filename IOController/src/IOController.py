#! /bin/python
#
# Main module for reading card & controlling IO 
#

import sys, argparse, time, datetime, logging, logging.config
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
argsparser.add_argument('-l', '--logConfig')
argsparser.add_argument('-L', '--loglevel', default='INFO')
args = argsparser.parse_args()

# Configure logging - either from a config file or manually
log = logging.getLogger()
if args.logConfig:
    logging.config.fileConfig(args.logConfig, disable_existing_loggers=False)
else:
    log.setLevel(getattr(logging, args.loglevel.upper()))
    # We need a stderr logger
    lh = logging.StreamHandler()
    lh.setFormatter(logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s'))
    log.addHandler(lh)
    # And our handler to send stuff out to IoT hubs
    iotLogHandler = IotHubLogHandler(level=logging.WARNING)
    iotLogHandler.setFormatter(logging.Formatter('%(levelname)s: %(message)s'))
    log.addHandler(iotLogHandler)

log.info('Start IOController process.')
config = IOControllerConfig(args.config)

seenUsers = {}
newCardId = 0
iotHubClient = IOTHub(config.iotHubConnectString, config)
for handler in [handler for handler in log.handlers if isinstance(handler, IotHubLogHandler)]:
    handler.setIotClient(iotHubClient)
prox = PCProx()
accessToken = AccessToken(tenant=config.tenant, clientId=config.clientId, clientSecret=config.clientSecret)
liquidApi = DXLiquidIntelApi(tenant=config.tenant, apiEndPoint=config.apiBaseUri, accessToken=accessToken)
groupMembership = GroupMembership(groups=config.accessGroupNames, accessToken=accessToken)
kegIO = Kegerator(config.tapsConfig)
while True:
    cardId = 0
    if newCardId != 0:
        cardId = newCardId
        newCardId = 0
    else:
        cardId = prox.readCard()
    if cardId != 0:
        log.debug('Card: %d has been read from reader', cardId)
        # Check our user cache
        cardKey = str(cardId)
        if cardKey in seenUsers and not seenUsers[cardKey].isExpired:
            user = seenUsers[cardKey]
        else:
            (personnelId, userId) = liquidApi.getUserForCardId(cardId)
            log.debug('Card: %d is associated with user: %d, %s', cardId, personnelId, userId)
            user = User(personnelId, userId, cardId, groupMembership.isUserMember(userId))
            seenUsers[cardKey] = user
        # Start session if the user is allowed
        if user.allowAccess:
            session = BeerSession(user, prox, kegIO, iotHubClient, config.sessionTimeout)
            newCardId = session.run()
        else:
            prox.beepFail()
            log.info('User: %s is NOT a permitted user', user.alias)
            time.sleep(3)


