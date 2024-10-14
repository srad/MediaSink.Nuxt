interface FieldValidator {
  name: string;
  pattern: RegExp;
  validMessage: string;
  invalidMessage: string;
}

interface ValidationMessage {
  message: string;
  isValid: boolean;
}

class FieldValidator {
  private readonly fieldConfig: { [key: string]: FieldValidator } = {};

  constructor(config: FieldValidator[]) {
    for (let i = 0; i < config.length; i++) {
      this.fieldConfig[config[i].name] = config[i]
    }
  }

  validate(name: string, value: any): ValidationMessage {
    const isValidTest = this.fieldConfig[name].pattern.test(value);

    const message = isValidTest ? this.fieldConfig[name].validMessage : this.fieldConfig[name].invalidMessage;
    return { isValid: isValidTest, message: `${message}: "${value}"` };
  }

  validateAll(validationRequest: { name: string, value: any }[]): ValidationMessage[] {
    return validationRequest.map(request => this.validate(request.name, request.value));
  }
}

export const createValidator = function (config: FieldValidator[]) {
  return new FieldValidator(config);
};