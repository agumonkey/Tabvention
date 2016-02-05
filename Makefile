doclean:
	find . -type f \( -iname "*~" -o -iname "#*#" \) -print -delete

clean:	doclean
	# clean
