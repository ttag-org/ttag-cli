import { ngettext, msgid } from 'ttag';

const n = 5;

ngettext(msgid`${n} банан`, `${n} банана`, `${n} бананів`, n);