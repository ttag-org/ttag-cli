# c-3po-cli

> status: proof of concept, work in progress

Command line utility for c-3po translation library

<!--- BEGIN COMMANDS --->

### `extract [output|lang] <src...>`
will extract translations to .pot file
#### Arguments
	-output  --o   result file with translations (.pot)  (default: translations.pot)
	-lang  --l   sets default lang (ISO format)  (default: en)


### `check [lang] <pofile> <src...>`
will check if all translations are present in .po file
#### Arguments
	-lang  --l   sets default lang (ISO format)  (default: en)


### `merge <path...>`
will merge two or more po(t) files together using first non-empty msgstr and header from left-most file


### `translate <path> [args]`
will open interactive prompt to translate all msgids with empty msgstr in cli
#### Arguments
	-output  --o   result file with translations (.po)  (default: translated.po)


### `stats <path>`
will display various pofile statistics(encoding, plurals, translated, fuzzyness)


### `filter <path> [args]`
will filter pofile by entry attributes(fuzzy, obsolete, (un)translated)
#### Arguments
	-fuzzy  --f   result file with fuzzy messages (.po)  (default: false)
	-no-fuzzy  --nf   result file without fuzzy messages (.po)  (default: false)
	-translated  --t   result file with translations (.po)  (default: false)
	-not-translated  --nt   result file without translations (.po)  (default: false)
	-reference  --r   a regexp to match references against  (default: )


### `init <lang> <filename>`
will create an empty .po file with all necessary headers for the locale
#### Arguments
	-lang   sets default locale (ISO format)  (default: en)
	-filename   path to the .po file  


### `update [lang] <pofile> <src..>`
will update existing po file. Add/remove new translations
#### Arguments
	-lang   sets default locale (ISO format)  (default: en)
	-pofile   path to .po file with translations  
	-src   path to source files/directories  


### `replace <pofile> <out> <path>`
will replace all strings with translations from the .po file


### `color <pofile>`
will output po(t)file with pretty colors on, combine with | less -r


### `spell <pofile> [locale]`
will spellcheck po file messages with given locale, locale can be autodetected from pofile


### `validate <pofile>`
will validate js template strings (`${x}`) in messages and translations and against each other


<!--- END COMMANDS --->

Please support c-3po-cli development by sending issues/PRs.
