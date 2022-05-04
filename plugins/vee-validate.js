import {extend, localize}                                   from "vee-validate";
import {required, email, confirmed, min, max, alpha_spaces} from "vee-validate/dist/rules";
import validateColor                                        from "validate-color";

const dictionary = {
  en: {
    messages: {
      required    : () => `This field is required`,
      email       : () => `Enter a valid email`,
      confirmed   : () => `Password does not match`,
      min         : (_, {length}) => `This field must be at least ${length} characters`,
      max         : (_, {length}) => `This field must be at less than ${length} characters`,
      phone       : () => `Phone is not valid`,
      alpha_spaces: (_, {field}) => `value is not valid`,
      color       : () => "Enter a Valid Color or Select one of templates"
    },
  },

  fa: {
    messages: {
      required    : () => `پر کردن این فیلد اجباری است`,
      email       : () => `ایمیل نا معتبر است`,
      confirmed   : () => `تکرار رمز عبور اشتباه است`,
      min         : (_, {length}) => `مقدار این فیلد باید حدافل  ${length}  کاراکتر باشد `,
      max         : (_, {length}) => `مقدار این فیلد نباید بیشتر از  ${length} کاراکتر باشد`,
      phone       : () => `شماره همراه نا معتبر است`,
      alpha_spaces: (_, {field}) => ` مقدار ورودی نامعتبر است`,
      color       : () => 'یک رنگ معتبر وارد کنید یا یکی از الگوها را انتخاب کنید'
    },
  },

};

extend("required", required);
extend("email", email);
extend("confirmed", confirmed);
extend("min", min);
extend("max", max);
extend("alpha_spaces", alpha_spaces);
extend("color", (value) => {
  return validateColor(value);
})


localize(dictionary);
