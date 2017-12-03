import { t, ngettext, msgid } from 'c-3po';

t`test`;
t`new`;

ngettext(msgid`${ n } banana`, `${n} bananas`, n);