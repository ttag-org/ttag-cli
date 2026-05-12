import { t } from 'ttag';

const x = t`hi from a module with decorators`

@myClassDecorator
class MyClass {
  @myFieldDecorator myField;
  @myAccessorDecortor accessor myAccessor;
  @myGetterDecorator get myGetter() { }
  @mySetterDecorator set mySetter(x) { }
  @methodDecorator hi() { }
}
