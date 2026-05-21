import validator from "validator";

export const validate = (data) => {
  const mandotoryField = ["username", "email", "password"];

  const isAllowed = mandotoryField.every((k) => Object.keys(data).includes(k));

  if (!isAllowed) {
    throw new Error("Field is missing");
  }

  if (!validator.isEmail(data.email)) {
    throw new Error("Invaild Email");
  }

  if (!validator.isStrongPassword(data.password)) {
    throw new Error("Weak password !!! set HardOne");
  }
};
