@echo off
IF "%SITE_TYPE%" == "webapp" (
  deploy.webapp.cmd
) ELSE (
  IF "%SITE_TYPE%" == "api" (
    deploy.api.cmd
  ) ELSE (
    IF "%SITE_TYPE%" == "app" (
      deploy.app.cmd
    ) ELSE (
      echo You have to set SITE_TYPE setting to either "webapp", "api" or "app"
      exit /b 1
    )
  )
)