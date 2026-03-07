settings.init.allow_root.set(true)
settings.log.level.set(3)

music_dir = '/var/radio/music'

# Robust track fetcher
def get_next_track() =
  # Fetch from Node.js bridge
  result = process.read.lines(timeout=3.0, "curl -s http://127.0.0.1:8080/internal/next")
  if list.length(result) > 0 then
    res = list.hd(default="", result)
    if res != "" and res != "NO_SCHEDULE" and res != "TRACK_NOT_FOUND" and res != "PLAYLIST_EMPTY" then
      log("Found scheduled item: #{res}")
      request.create(res)
    else
      request.create("")
    end
  else
    request.create("")
  end
end

# Primary source: Dashboard schedule
# Wrapper cue_cut() ensures annotations like liq_cue_in are respected by the decoder
my_source = cue_cut(request.dynamic(id="boden_dashboard", prefetch=1, get_next_track))

# Fallback: Random music
fallback_music = playlist(music_dir, mode='randomize', reload_mode='watch')

# Final output source
radio = fallback(track_sensitive=false, [my_source, fallback_music, blank()])

# Safety
radio = mksafe(radio)

# Output 128 kbps
output.icecast(%mp3(bitrate=128), 
  host='127.0.0.1', port=9090, 
  password='AgileRadio2026!', mount='stream.mp3', 
  name="BØDEN RADIO",
  description="BØDEN Online Live",
  radio)
