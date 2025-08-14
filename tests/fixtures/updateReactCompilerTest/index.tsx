import React from 'react';
import { msgid, ngettext, t } from 'ttag';
import { Box } from '@prom-ui/core/Box';
import { Text } from '@prom-ui/core/Text';

import type { Product } from 'portable/types/auto';

type CompanyType = {
    title: string;
    companies: { name: string; address: string }[];
};

type WarrantyType = {
    warrantyPeriod: Product['warranty_period'];
};

const WarrantyPeriodRow: React.FC<WarrantyType> = ({ warrantyPeriod }) => {
    if (!warrantyPeriod) return null;
    const monthText = ngettext(msgid`месяц`, `месяца`, `месяцев`, warrantyPeriod);
    return (
        <Box box-margin-bottom='l'>
            <Box box-margin-bottom='s'>
                <Text text-weight='bold'>{t`Гарантийный срок`}</Text>
            </Box>
            <Box
                box-margin-bottom='s'
                box-padding-left='l'
            >
                {warrantyPeriod}
                &nbsp;
                {monthText}
            </Box>
        </Box>
    );
};
