import { addToast, Button } from "@heroui/react";
import classNames from "classnames";
import { Form, FormInput, useForm } from "components";
import { FC, useState } from "react";
import { object, string } from "yup";

import classes from "./App.module.scss";
import reactLogo from "./assets/react.svg";
import appLogo from "/favicon.svg";
import PWABadge from "./PWABadge.tsx";

export const App: FC = () => {
  const [count, setCount] = useState<string>(0);
  const formMethods = useForm({
    schema: object({ text: string().label("Example text").meta({ placeholder: "Example placeholder" }).required() }),
    onSuccess: ({ text }) => addToast({ title: text }),
  });

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <a href="https://vite.dev" target="_blank">
          <img src={appLogo} className={classes.logo} alt="alt-parking logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className={classNames(classes.logo, classes.react)}
            title="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>alt-parking</h1>
      <div className={classes.card}>
        <Button color="primary" onPress={() => setCount((count) => count + 1)}>
          count is {count}
        </Button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={classes.readTheDocs}>Click on the Vite and React logos to learn more</p>
      <PWABadge />

      <Form {...formMethods}>
        <FormInput name="text" />
        <Button onPress={formMethods.submit}>Submit</Button>
      </Form>
    </div>
  );
};
