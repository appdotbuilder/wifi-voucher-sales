
import { afterEach, beforeEach, describe, expect, it } from 'bun:test';
import { resetDB, createDB } from '../helpers';
import { loginAdmin } from '../handlers/login_admin';

// Define test types
interface LoginInput {
  username: string;
  password: string;
}

const validLoginInput: LoginInput = {
  username: 'admin',
  password: 'password123'
};

const invalidLoginInput: LoginInput = {
  username: 'admin',
  password: 'wrongpassword'
};

describe('loginAdmin', () => {
  beforeEach(createDB);
  afterEach(resetDB);

  it('should login successfully with correct credentials', async () => {
    const result = await loginAdmin(validLoginInput);

    expect(result.success).toBe(true);
    expect(result.admin).toBeDefined();
    expect(result.admin!.username).toEqual('admin');
    expect(result.admin!.password).toEqual(''); // Password should not be returned
    expect(result.admin!.id).toBeDefined();
    expect(result.admin!.created_at).toBeInstanceOf(Date);
    expect(result.admin!.updated_at).toBeInstanceOf(Date);
  });

  it('should fail with incorrect password', async () => {
    const result = await loginAdmin(invalidLoginInput);

    expect(result.success).toBe(false);
    expect(result.admin).toBeUndefined();
  });

  it('should fail with non-existent username', async () => {
    const nonExistentInput: LoginInput = {
      username: 'nonexistent',
      password: 'anypassword'
    };

    const result = await loginAdmin(nonExistentInput);

    expect(result.success).toBe(false);
    expect(result.admin).toBeUndefined();
  });

  it('should not return password in successful response', async () => {
    const result = await loginAdmin(validLoginInput);

    expect(result.success).toBe(true);
    expect(result.admin).toBeDefined();
    expect(result.admin!.password).toEqual('');
  });

  it('should handle empty username', async () => {
    const emptyUsernameInput: LoginInput = {
      username: '',
      password: 'password123'
    };

    const result = await loginAdmin(emptyUsernameInput);

    expect(result.success).toBe(false);
    expect(result.admin).toBeUndefined();
  });
});
