
import sys, os, logging, requests, shutil, tarfile
from tempfile import NamedTemporaryFile

log = logging.getLogger(__name__)

class MethodHandler(object):

    def __init__(self, installDir):
        self._installDir = installDir

    def updateFirmware(self, firmwareSource, version, operationId, iotClient):
        try:
            location = os.path.join(self._installDir.value, version)
            os.mkdir(location)
            log.info('Updating firmware to version: %s, source: %s, location: %s, operation: %s', version, firmwareSource, location, operationId)
            status = {'operationId': operationId, 'version': version, 'state': 'Pending'}
            # Download the specified package
            with NamedTemporaryFile() as fh:
                req = requests.get(firmwareSource, stream=True)
                req.raise_for_status()
                shutil.copyfileobj(req.raw, fh)
                fh.seek(0)
                with tarfile.open(fh) as tar:
                    tar.extractall(location)
        except:
            log.warning('Failed to apply firmware update. Version: %s, operation: %s', version, operationId, exc_info=1)
