# Place scrcpy files here

Download scrcpy for Windows from:
https://github.com/Genymobile/scrcpy/releases

Extract and copy ALL files (scrcpy.exe + DLLs) into this folder.

Required files:
- scrcpy.exe
- scrcpy-server
- adb.exe
- AdbWinApi.dll
- AdbWinUsbApi.dll
- SDL2.dll
- ffmpeg DLLs (avcodec, avformat, avutil, swresample, swscale)

The Electron app will automatically find scrcpy.exe from this folder.
