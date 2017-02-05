#! /bin/python
#
# Main module for reading card & controlling IO 
#

import sys, argparse, time, datetime, logging, logging.config, signal, multiprocessing
from IOControllerConfig import IOControllerConfig
from pcProx import PCProx
from DXLiquidIntelApi import DXLiquidIntelApi
from User import User
from KegIO import Kegerator
from BeerSession import Session
from IOTHubs import IOTHub
from IotHubLogHandler import IotHubLogHandler
from MethodHandler import MethodHandler

argsparser = argparse.ArgumentParser()
argsparser.add_argument('-c', '--config', action='append')
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

stop_event = multiprocessing.Event()
signal.signal(signal.SIGTERM, lambda x,y: stop_event.set())

seenUsers = {}
newCardId = 0
iotHubClient = IOTHub(config.iotHubConnectString, config, MethodHandler(config.installDir))
for handler in [handler for handler in log.handlers if isinstance(handler, IotHubLogHandler)]:
    handler.setIotClient(iotHubClient)
prox = PCProx()
liquidApi = DXLiquidIntelApi(apiEndPoint=config.apiBaseUri, apiUser=config.apiUser, apiKey=config.apiKey)
kegIO = Kegerator(config.tapsConfig)
while not stop_event.is_set():
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
            (userValid, personnelId) = liquidApi.isUserAuthenticated(cardId)
            log.debug('Card: %d is associated with user: %s', cardId, str(personnelId))
            user = User(personnelId, cardId, userValid)
            seenUsers[cardKey] = user
        # Start session if the user is allowed
        if user.allowAccess:
            session = BeerSession(user, prox, kegIO, iotHubClient, config.sessionTimeout)
            newCardId = session.run()
        else:
            prox.beepFail()
            log.info('User: %s is NOT a permitted user', str(user.personnelId))
            time.sleep(3)

log.info('End IOController - due to SIGTERM')
