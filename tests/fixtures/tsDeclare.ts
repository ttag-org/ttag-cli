import { t } from "ttag";

declare namespace MyNamespace {
 function namespaceFunction(): void;
}

declare function myFunction(): void;
declare const myConst: number;
declare const myLet: number;

class MyClass {
  declare myClassField: void;
}

declare class MyClassDeclaration {
  method(): void;
}

declare module "hi" {

}

const x = t`hi from a module with typescript declare`
