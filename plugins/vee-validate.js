import {extend, localize}                                   from "vee-validate";
import {required, email, confirmed, min, max, alpha_spaces} from "vee-validate/dist/rules";

const dictionary = {
  en: {
    messages: {
      required    : () => `This field is required`,
      email       : () => `Enter a valid email`,
      confirmed   : () => `Password does not match`,
      min         : (_, {length}) => `This field must be at least ${length} characters`,
      max         : (_, {length}) => `This field must be at less than ${length} characters`,
      phone       : () => `Phone is not valid`,
      alpha_spaces: (_, {field}) => `${_} is not valid`,
    },
  },
};

extend("required", required);
extend("email", email);
extend("confirmed", confirmed);
extend("min", min);
extend("max", max);
extend("alpha_spaces", alpha_spaces);


localize(dictionary);
