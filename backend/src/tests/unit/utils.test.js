const { 
  formatResponse, 
  generateId, 
  isValidEmail, 
  calculateAge 
} = require('../../../utils/helpers');

describe('Utility Functions', () => {
  test('formatResponse should format successful response', () => {
    const response = formatResponse(true, 'Operation successful', { id: 1 });
    
    expect(response.success).toBe(true);
    expect(response.message).toBe('Operation successful');
    expect(response.data).toEqual({ id: 1 });
    expect(response.timestamp).toBeDefined();
  });

  test('generateId should generate unique string', () => {
    const id1 = generateId();
    const id2 = generateId();
    
    expect(typeof id1).toBe('string');
    expect(id1).not.toBe(id2);
  });

  test('isValidEmail should validate email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('invalid-email')).toBe(false);
  });

  test('calculateAge should calculate age from birth date', () => {
    const birthDate = new Date();
    birthDate.setFullYear(birthDate.getFullYear() - 25);
    
    expect(calculateAge(birthDate.toISOString())).toBe(25);
  });
});