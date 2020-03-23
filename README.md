# ttag-cli

> :warning: This project [was previously named `c-3po-cli`](https://github.com/ttag-org/ttag/issues/105).
> Some of the talks, presentations, and documentation _may_ reference it with both names.

Command line utility for [ttag](https://github.com/ttag-org/ttag) translation library.
Works out of the box with **js**, **ts**, **jsx**, **tsx**, **vue**, **svelte**,  files.

# Installation
```bash
npm install ttag-cli
# or global
npm install -g ttag-cli
```

# Usage example:
```
ttag extract some.js
```

# Comands description
<!--- BEGIN COMMANDS --->

### `extract [output|lang] <src...>`
will extract translations to .pot file
#### Arguments:
	--output  -o   result file with translations (.pot)  (default: translations.pot)
	--lang  -l   sets default lang (ISO format)  (default: en)
	--discover   string overrides babel-plugi-ttag setting - https://ttag.js.org/docs/plugin-api.html#configdiscover. Can be used to discover ttag functions without explicit import.    Only known ttag functions can be used as params (t, jt, ngettext, gettext, _)  
	--numberedExpressions   boolean overrides babel-plugin-ttag setting -  https://ttag.js.org/docs/plugin-api.html#confignumberedexpressions. Refer to the doc for the details.  
	--extractLocation   string - 'full' | 'file' | 'never' - https://ttag.js.org/docs/plugin-api.html#configextractlocation. Is used to format location comments in the .po file.
	--sortByMsgid boolean. Will sort output in alphabetically by msgid. https://ttag.js.org/docs/plugin-api.html#configsortbymsgid


### `check [lang] <pofile> <src...>`
will check if all translations are present in .po file
#### Arguments:
	--lang  -l   sets default lang (ISO format)  (default: en)
	--discover   string overrides babel-plugi-ttag setting - https://ttag.js.org/docs/plugin-api.html#configdiscover. Can be used to discover ttag functions without explicit import.    Only known ttag functions can be used as params (t, jt, ngettext, gettext, _)  
	--numberedExpressions   boolean overrides babel-plugin-ttag setting -  https://ttag.js.org/docs/plugin-api.html#confignumberedexpressions. Refer to the doc for the details.  


### `merge <path...>`
will merge two or more po(t) files together using first non-empty msgstr and header from left-most file


### `translate <path> [args]`
will open interactive prompt to translate all msgids with empty msgstr in cli
#### Arguments:
	--output  -o   result file with translations (.po)  (default: translated.po)


### `stats <path>`
will display various pofile statistics(encoding, plurals, translated, fuzzyness)


### `filter <path> [args]`
will filter pofile by entry attributes(fuzzy, obsolete, (un)translated)
#### Arguments:
	--fuzzy  -f   result file with fuzzy messages (.po)  (default: false)
	--no-fuzzy  -nf   result file without fuzzy messages (.po)  (default: false)
	--translated  -t   result file with translations (.po)  (default: false)
	--not-translated  -nt   result file without translations (.po)  (default: false)
	--reference  -r   a regexp to match references against  (default: )
#### Example:
	 ttag filter -nt small.po

	 msgid "test"
	 msgstr ""

### `init <lang> <filename>`
will create an empty .po file with all necessary headers for the locale
#### Arguments:
	--lang   sets default locale (ISO format)  (default: en)
	--filename   path to the .po file  


### `update [opts] <pofile> <src..>`
will update existing po file. Add/remove new translations
#### Arguments:
	--lang   sets default locale (ISO format)  (default: en)
	--pofile   path to .po file with translations  
	--src   path to source files/directories  
	--discover   string overrides babel-plugi-ttag setting - https://ttag.js.org/docs/plugin-api.html#configdiscover. Can be used to discover ttag functions without explicit import.    Only known ttag functions can be used as params (t, jt, ngettext, gettext, _)  
	--numberedExpressions   boolean overrides babel-plugin-ttag setting -  https://ttag.js.org/docs/plugin-api.html#confignumberedexpressions. Refer to the doc for the details.
	--extractLocation   string - 'full' | 'file' | 'never' - https://ttag.js.org/docs/plugin-api.html#configextractlocation. Is used to format location comments in the .po file.
	--sortByMsgid boolean. Will sort output in alphabetically by msgid. https://ttag.js.org/docs/plugin-api.html#configsortbymsgid


### `replace [options] <pofile> <out> <path>`
will replace all strings with translations from the .po file
#### Arguments:
	--discover   string overrides babel-plugi-ttag setting - https://ttag.js.org/docs/plugin-api.html#configdiscover. Can be used to discover ttag functions without explicit import.    Only known ttag functions can be used as params (t, jt, ngettext, gettext, _)  
	--numberedExpressions   boolean overrides babel-plugin-ttag setting -  https://ttag.js.org/docs/plugin-api.html#confignumberedexpressions. Refer to the doc for the details.  


### `color <pofile>`
will output po(t)file with pretty colors on, combine with | less -r


### `spell <pofile> [locale]`
will spellcheck po file messages with given locale, locale can be autodetected from pofile


### `validate <pofile>`
will validate js template strings (`${x}`) in messages and translations and against each other


### `web <pofile>`
will open pofile in web editor


### `po2json <pofile> [args]`
will parse and output po file as loadable JSON
#### Arguments:
	--pretty  -p   pretty print js  (default: false)
	--nostrip  --n   do not strip comments/headers  (default: false)
	--format  sets the output JSON format (compact is much smaller)
        [choices: "compact", "verbose"] [default: "verbose"]


<!--- END COMMANDS --->

Please support ttag-cli development by sending issues/PRs.
