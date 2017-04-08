
import os, sys, logging, threading, tempfile, shutil, tarfile, inspect
from ConfigParser import RawConfigParser
import requests
from DXLiquidIntelApi import DXLiquidIntelApi

log = logging.getLogger(__name__)

class UpdateManager:
    def __init__(self, liquidApi, packageType, checkUnpublished, packageCheckInterval, configuredInstallDir):
        self._liquidApi = liquidApi
        # We assume the last segment in the installation directory is the version label
        (self._baseInstallDir, self._semanticVersion) = os.path.split(self._getInstallDir(configuredInstallDir))
        self._packageType = packageType
        self._checkUnpublished = checkUnpublished
        self._packageCheckInterval = packageCheckInterval
        self._restartRequired = False
        # Initial check is synchronous
        self.checkForNewVersion()

    def __enter__(self):
        pass

    def __exit__(self, type, value, traceback):
        if self._timer:
            self._timer.cancel()

    def checkForNewVersion(self):
        self._timer = None
        restartTimer = True
        log.info('Checking for newer version from package manager api')
        packages = self._liquidApi.getInstallationPackages(self._semanticVersion, self._packageType.value, self._checkUnpublished.value)
        if len(packages) > 0:
            log.info('New installation packages detected: %s', packages)
            installPackage = packages[-1]
            newInstallDir = os.path.join(self._baseInstallDir, installPackage["Version"])
            log.info('Installing package version: %s at: %s. Download location: %s. %s', installPackage["Version"], newInstallDir, installPackage["PackageUri"], installPackage["Description"])
            try:
                # Download the package
                downloadReq = requests.get(installPackage["PackageUri"], stream = True)
                downloadReq.raise_for_status()
                # Create a new installation directory, using the version label 
                if os.path.exists(newInstallDir):
                    log.warning('Installation directory %s already exists - this will overwrite existing contents', newInstallDir)
                else:
                    os.makedirs(newInstallDir)
                # Assume package content is .tar.gz - unfortunately we can't stream the response directly into the tar extractor as the 
                # HTTP response stream doesn't support seek()
                with tempfile.NamedTemporaryFile(prefix="package-tarball-", suffix=".tar.gz", delete=False) as fd:
                    shutil.copyfileobj(downloadReq.raw, fd)
                    fd.seek(0)
                    tar = tarfile.open(fileobj=fd)
                    tar.extractall(newInstallDir)
                # Point the symlink to the new directory
                if sys.platform != 'win32':
                    currentSymlink = os.path.join(self._baseInstallDir, 'current')
                    if os.path.exists(currentSymlink):
                        os.remove(currentSymlink)
                    os.symlink(newInstallDir, currentSymlink)
                # Check if this version has any configuration that we need to apply locally
                if 'Configuration' in installPackage and installPackage['Configuration']:
                    configFile = os.path.join(newInstallDir, 'IOController.cfg')
                    log.info('Writing version-specific configuration to: %s', configFile)
                    config = RawConfigParser()
                    # Convert from JSON form to .INI form by intepreting all object values as sections
                    # and all others as primitive values in the parent section
                    # Top level should be section names with values
                    for (section, values) in installPackage['Configuration'].items():
                        if not isinstance(values, dict):
                            log.warning('Package configuration for keg/section: %s does not contain an object. Non-objects are not supported.', section);
                        else:
                            config.add_section(section)
                            for (setting, value) in values.items():
                                config.set(section, setting, value)
                    with open(configFile, 'w') as fd:
                        config.write(fd)

                self._restartRequired = True
                # No need to restart the timer as we're bailing on the next main loop iteration
                restartTimer = False
            except:
                log.warning('Failed to download installation package. Will retry on next interval.', exc_info=1)
            
        if restartTimer:
            self._timer = threading.Timer(self._packageCheckInterval.value, self.checkForNewVersion)
            self._timer.start()

    @property
    def restartRequired(self):
        return self._restartRequired

    @property
    def semanticVersion(self):
        return self._semanticVersion

    def _getInstallDir(self, configuredInstallDir):
        if configuredInstallDir or sys.platform == 'win32':
            return configuredInstallDir
        return os.path.dirname(os.path.realpath(inspect.getabsfile(UpdateManager)))        

