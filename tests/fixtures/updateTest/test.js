import { t, ngettext, msgid } from 'ttag';

t`test`;
t`new`;

ngettext(msgid`${ n } banana`, `${n} bananas`, n);

_('discover _ test');
