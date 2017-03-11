#! /bin/python
#
# Main module for reading card & controlling IO 
#

import sys, argparse, time, datetime, logging, logging.config, signal, multiprocessing
from IOControllerConfig import IOControllerConfig
from pcProx import PCProx
from DXLiquidIntelApi import DXLiquidIntelApi
from UserCache import UserCache
from User import User
from KegIO import Kegerator
from BeerSession import SessionManager

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

log.info('Start IOController process.')
config = IOControllerConfig(args.config)

stop_event = multiprocessing.Event()
signal.signal(signal.SIGTERM, lambda x,y: stop_event.set())

prox = PCProx()
liquidApi = DXLiquidIntelApi(apiEndPoint=config.apiBaseUri, apiUser=config.apiUser, apiKey=config.apiKey, requestTimeout=config.apiRequestTimeout)
kegIO = Kegerator(config.tapsConfig)
sessionManager = SessionManager(prox, kegIO, liquidApi, config.sessionTimeout, config.inactivityTimeout)
userCache = UserCache(liquidApi, config.userCacheTtl)
with kegIO, userCache:
    prox.beepEndSession()
    while not stop_event.is_set():
        cardId = sessionManager.apply()
        if cardId != 0:
            log.debug('Card: %d has been read from reader', cardId)
            # Check our user cache
            cardKey = str(cardId)
            user = userCache.lookup(cardKey)
            if user is None or user.isExpired:
                (userValid, personnelId, fullName) = liquidApi.isUserAuthenticated(cardId)
                log.debug('Card: %d is associated with user: %s (%s)', cardId, str(personnelId), str(fullName))
                user = User(personnelId, cardId, fullName, userValid, config.userCacheTtl.value)
                userCache.add(cardKey, user)
            # Start session if the user is allowed
            if user.allowAccess:
                log.debug('Starting beer session for: %d:%s', user.personnelId, user.fullName)
                sessionManager.startSession(user)
            else:
                prox.beepFail()
                log.info('User: %s is NOT a permitted user', str(user.personnelId))
                time.sleep(3)
        else:
            time.sleep(1)
    prox.beepEndSession()

log.info('End IOController - due to SIGTERM')
