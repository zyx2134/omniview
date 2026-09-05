; Omniview NSIS installer script
; Registers file associations so double-clicking a file opens Omniview

!macro customInstall
  ; Register file associations for common formats
  WriteRegStr HKCR ".png"   ""  "Omniview.png"
  WriteRegStr HKCR ".jpg"   ""  "Omniview.jpg"
  WriteRegStr HKCR ".jpeg"  ""  "Omniview.jpeg"
  WriteRegStr HKCR ".gif"   ""  "Omniview.gif"
  WriteRegStr HKCR ".svg"   ""  "Omniview.svg"
  WriteRegStr HKCR ".bmp"   ""  "Omniview.bmp"
  WriteRegStr HKCR ".webp"  ""  "Omniview.webp"
  WriteRegStr HKCR ".mp4"   ""  "Omniview.mp4"
  WriteRegStr HKCR ".webm"  ""  "Omniview.webm"
  WriteRegStr HKCR ".avi"   ""  "Omniview.avi"
  WriteRegStr HKCR ".mov"   ""  "Omniview.mov"
  WriteRegStr HKCR ".mkv"   ""  "Omniview.mkv"
  WriteRegStr HKCR ".mp3"   ""  "Omniview.mp3"
  WriteRegStr HKCR ".wav"   ""  "Omniview.wav"
  WriteRegStr HKCR ".flac"  ""  "Omniview.flac"
  WriteRegStr HKCR ".txt"   ""  "Omniview.txt"
  WriteRegStr HKCR ".md"    ""  "Omniview.md"
  WriteRegStr HKCR ".json"  ""  "Omniview.json"
  WriteRegStr HKCR ".html"  ""  "Omniview.html"
  WriteRegStr HKCR ".css"   ""  "Omniview.css"
  WriteRegStr HKCR ".js"    ""  "Omniview.js"
  WriteRegStr HKCR ".ts"    ""  "Omniview.ts"
  WriteRegStr HKCR ".glb"   ""  "Omniview.glb"
  WriteRegStr HKCR ".gltf"  ""  "Omniview.gltf"
  WriteRegStr HKCR ".obj"   ""  "Omniview.obj"

  ; Associate each extension with Omniview executable
  ; Format: HKCR\.ext\OpenWithProgids = Omniview.app
  WriteRegStr HKCR "Omniview.png"   ""  "Omniview PNG File"
  WriteRegStr HKCR "Omniview.png\shell\open\command" "" '"$INSTDIR\Omniview.exe" "%1"'
  WriteRegStr HKCR ".png\OpenWithProgids" "Omniview.png" ""

  WriteRegStr HKCR "Omniview.jpg"   ""  "Omniview JPEG File"
  WriteRegStr HKCR "Omniview.jpg\shell\open\command" "" '"$INSTDIR\Omniview.exe" "%1"'
  WriteRegStr HKCR ".jpg\OpenWithProgids" "Omniview.jpg" ""

  WriteRegStr HKCR "Omniview.mp4"   ""  "Omniview MP4 File"
  WriteRegStr HKCR "Omniview.mp4\shell\open\command" "" '"$INSTDIR\Omniview.exe" "%1"'
  WriteRegStr HKCR ".mp4\OpenWithProgids" "Omniview.mp4" ""

  WriteRegStr HKCR "Omniview.mp3"   ""  "Omniview MP3 File"
  WriteRegStr HKCR "Omniview.mp3\shell\open\command" "" '"$INSTDIR\Omniview.exe" "%1"'
  WriteRegStr HKCR ".mp3\OpenWithProgids" "Omniview.mp3" ""

  WriteRegStr HKCR "Omniview.txt"   ""  "Omniview Text File"
  WriteRegStr HKCR "Omniview.txt\shell\open\command" "" '"$INSTDIR\Omniview.exe" "%1"'
  WriteRegStr HKCR ".txt\OpenWithProgids" "Omniview.txt" ""

  WriteRegStr HKCR "Omniview.glb"   ""  "Omniview GLB File"
  WriteRegStr HKCR "Omniview.glb\shell\open\command" "" '"$INSTDIR\Omniview.exe" "%1"'
  WriteRegStr HKCR ".glb\OpenWithProgids" "Omniview.glb" ""

  ; Desktop shortcut
  CreateShortCut "$DESKTOP\Omniview.lnk" "$INSTDIR\Omniview.exe"
!macroend

!macro customUninstall
  ; Remove file associations
  DeleteRegKey HKCR "Omniview.png"
  DeleteRegKey HKCR ".png\OpenWithProgids"
  DeleteRegKey HKCR "Omniview.jpg"
  DeleteRegKey HKCR ".jpg\OpenWithProgids"
  DeleteRegKey HKCR "Omniview.mp4"
  DeleteRegKey HKCR ".mp4\OpenWithProgids"
  DeleteRegKey HKCR "Omniview.mp3"
  DeleteRegKey HKCR ".mp3\OpenWithProgids"
  DeleteRegKey HKCR "Omniview.txt"
  DeleteRegKey HKCR ".txt\OpenWithProgids"
  DeleteRegKey HKCR "Omniview.glb"
  DeleteRegKey HKCR ".glb\OpenWithProgids"

  ; Also clean up individual extension keys
  DeleteRegValue HKCR ".png\OpenWithProgids" "Omniview.png"
  DeleteRegValue HKCR ".jpg\OpenWithProgids" "Omniview.jpg"
  DeleteRegValue HKCR ".mp4\OpenWithProgids" "Omniview.mp4"
  DeleteRegValue HKCR ".mp3\OpenWithProgids" "Omniview.mp3"
  DeleteRegValue HKCR ".txt\OpenWithProgids" "Omniview.txt"
  DeleteRegValue HKCR ".glb\OpenWithProgids" "Omniview.glb"

  Delete "$DESKTOP\Omniview.lnk"
!macroend
