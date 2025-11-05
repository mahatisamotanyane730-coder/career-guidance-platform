const { authValidation } = require('../../../middleware/validation');

describe('Validation Schemas', () => {
  test('login schema should validate correct data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123'
    };

    const { error } = authValidation.login.validate(validData);
    expect(error).toBeUndefined();
  });

  test('login schema should reject invalid email', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123'
    };

    const { error } = authValidation.login.validate(invalidData);
    expect(error).toBeDefined();
  });
});