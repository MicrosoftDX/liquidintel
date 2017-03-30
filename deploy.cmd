@echo off
IF "%SITE_TYPE%" == "webapp" (
  deploy.webapp.cmd
) ELSE (
  IF "%SITE_TYPE%" == "api" (
    deploy.api.cmd
  ) ELSE (
    echo You have to set SITE_TYPE setting to either "webapp" or "api"
    exit /b 1
  )
)