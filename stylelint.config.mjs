/** @type {import("stylelint").Config} */
export default {
  extends: ["stylelint-config-standard-scss", "stylelint-config-recess-order"],
  rules: {
    "selector-class-pattern": [
      "^[a-z][a-zA-Z0-9]+$", // camelCase
      {
        message: "Class selector should be camelCase",
      },
    ],
  },
};
