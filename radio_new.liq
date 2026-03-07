settings.init.allow_root.set(true)

music_dir = '/var/radio/music'

def get_next_track() =
  result = process.read.lines("curl -s http://127.0.0.1:8080/internal/next")
  if list.length(result) > 0 then
    res = list.hd(default="", result)
    if res == "NO_SCHEDULE" or res == "TRACK_NOT_FOUND" or res == "PLAYLIST_EMPTY" then
      request.create("")
    else
      request.create(res)
    end
  else
    request.create("")
  end
end

my_source = request.dynamic(id="boden_dashboard", get_next_track)

fallback_music = playlist(music_dir, mode='randomize', reload_mode='watch')

radio = fallback(track_sensitive=true, [my_source, fallback_music, blank()])

# Output at 192 kbps
output.icecast(%mp3(bitrate=192), 
  host='127.0.0.1', port=9090, 
  password='AgileRadio2026!', mount='stream.mp3', 
  name="BØDEN RADIO",
  description="BØDEN Live Broadcast",
  radio)
