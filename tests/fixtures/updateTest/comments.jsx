import { jt , t } from "ttag";

// test comment
t`test`

const Component = () => {
  return <MyComponent>{/* translator: jsx test comment */ jt`jsx test`}</MyComponent>
}