@echo off
@cd /d "%~dp0"
IF NOT EXIST "C:\Program Files\Adobe\Adobe Photoshop CC 2019" goto exit
xcopy /s generator.js "C:\Program Files\Adobe\Adobe Photoshop CC 2019\Required\Generator-builtin\lib" /Y
if %ERRORLEVEL% == 0 echo "Done Installing Generator to BuiltIn Generator Folder"
xcopy /s /i "DeployVersion" "C:\Program Files\Adobe\Adobe Photoshop CC 2019\Plug-ins\Generator\DeployVersion"
if %ERRORLEVEL% == 0 echo "Done Installing DeployVersion to Photoshop Plugins Folder"
xcopy /s /i "ContainerPanel" "C:\Program Files\Adobe\Adobe Photoshop CC 2019\Required\CEP\extensions\ContainerPanel"
if %ERRORLEVEL% == 0 echo "Done Installing ConatinerPanel to Photoshop CEP/Extensions Folder"
xcopy /s /i "ValidatorPanel" "C:\Program Files\Adobe\Adobe Photoshop CC 2019\Required\CEP\extensions\ValidatorPanel"
if %ERRORLEVEL% == 0 echo "Done Installing ValidatorPanel to Photoshop CEP/Extensions Folder"
echo %ERRORLEVEL%
if NOT %ERRORLEVEL% == 0 echo "Installation Unsuccessful"
if %ERRORLEVEL% == 0 echo "Installation Successful" 
goto Success
:exit 
echo "Correct Photoshop Path Does Not Exist"
:Success
pause