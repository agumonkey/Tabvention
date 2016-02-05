doclean:
	find . -type f \( -iname "*~" -o -iname "#*#" \) -print -delete

clean:	doclean
	# clean

build:
	# lint
	# minify
	# ...

export:	build
	# archive tabvention.arch \
	# tabvention.js \
	# manifest.json \
	# **/*.min.js \
	# **/*.html \
	# **/*.css \
	# **/*.png
