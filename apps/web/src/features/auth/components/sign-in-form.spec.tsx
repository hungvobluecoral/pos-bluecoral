import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { SignInForm } from './sign-in-form';
import * as authActions from '../actions/auth-actions';

jest.mock('../actions/auth-actions', () => ({
  loginAction: jest.fn(),
}));

const mockLoginAction = authActions.loginAction as jest.MockedFunction<typeof authActions.loginAction>;

describe('SignInForm', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  function fillAndSubmit(email = 'test@branch.com', password = 'secret') {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/mật khẩu/i), { target: { value: password } });
    const form = screen.getByRole('button', { name: /đăng nhập/i }).closest('form')!;
    fireEvent.submit(form);
  }

  it('renders email and password fields with a submit button', () => {
    render(<SignInForm />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/mật khẩu/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /đăng nhập/i })).toBeInTheDocument();
  });

  it('calls loginAction with normalized email and password on submit', async () => {
    mockLoginAction.mockResolvedValue({ ok: true, data: { accessToken: 'tok', expiresIn: 900, staffId: 's1', tenantId: 't1', branchId: 'b1', role: 'cashier', sessionId: 'sess1' } });
    const onSuccess = jest.fn();
    render(<SignInForm onSuccess={onSuccess} />);

    await act(async () => {
      fillAndSubmit('Cashier@Branch.COM', 'secret');
    });

    expect(mockLoginAction).toHaveBeenCalledWith({ email: 'cashier@branch.com', password: 'secret' });
    await waitFor(() => expect(onSuccess).toHaveBeenCalled());
  });

  it('displays error message on login failure', async () => {
    mockLoginAction.mockResolvedValue({ ok: false, error: { code: 'invalid-credentials', message: 'Email hoặc mật khẩu không đúng.' } });
    render(<SignInForm />);

    await act(async () => {
      fillAndSubmit();
    });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/email hoặc mật khẩu không đúng/i);
    });
  });

  it('disables form controls while login is in progress', async () => {
    let resolve: () => void;
    mockLoginAction.mockReturnValue(new Promise<{ ok: false; error: { code: string; message: string } }>((r) => {
      resolve = () => r({ ok: false, error: { code: 'err', message: 'err' } });
    }));

    render(<SignInForm />);
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'x@x.com' } });
    fireEvent.change(screen.getByLabelText(/mật khẩu/i), { target: { value: 'pass' } });

    await act(async () => {
      const form = screen.getByRole('button', { name: /đăng nhập/i }).closest('form')!;
      fireEvent.submit(form);
    });

    expect(screen.getByRole('button')).toBeDisabled();

    await act(async () => { resolve!(); });
  });

  it('shows generic fallback error when loginAction returns ok:false without message', async () => {
    mockLoginAction.mockResolvedValue({ ok: false });
    render(<SignInForm />);

    await act(async () => { fillAndSubmit(); });

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/đăng nhập thất bại/i);
    });
  });
});
