import { t, c } from 'ttag';
const num1 = 1;
const num2 = 2;

t`test ${num1}`;

t`test ${num2}`;

c('ctx1').t`test ${num1}`;

c('ctx2').t`test ${num1}`;
