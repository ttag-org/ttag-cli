import { ngettext, msgid } from 'c-3po';

const n = 5;

ngettext(msgid`${n} банан`, `${n} банана`, `${n} бананів`, n);