settings.init.allow_root.set(true)
radio = single("/var/radio/music/test.mp3")
radio = mksafe(radio)
output.icecast(%mp3(bitrate=192), 
  host='127.0.0.1', port=9090, 
  password='AgileRadio2026!', mount='stream.mp3', 
  radio)
