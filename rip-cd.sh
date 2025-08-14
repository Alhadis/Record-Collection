#!/bin/sh
set +e

# Declare a list of commands as program dependencies
require(){
	set -- "" "$@"
	while [ $# -gt 1 ]; do
		if command >/dev/null 2>&1 -v "$2"; then
			eval "shift 2 && set -- \"$1\" \"\$@\""
			continue
		fi
		eval "shift 2 && set -- \"$1, $2\" \"\$@\""
	done
	if [ -n "$1" ]; then
		printf >&2 'Required command(s) not found: %s\n' "${1#, }"
		return 1
	fi
}

require doas cdio cd-info sha256
exit

doas cdio cdrip
doas cdio -vv info > track-info.txt || echo "Error code $?"
doas cdio cdid > cdid.txt
doas chown Alhadis *
doas chmod 0444 *
doas cd-info -qA --no-cddb-cache --no-device-info --no-header > cd-info.log
sha256 -r *.wav | sed 's/  */  /' > SHA256
doas cdio eject
