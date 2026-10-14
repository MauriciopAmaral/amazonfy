import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import logo from "../assets/logo/logo-amazunfy-320.png";
import { useAuth } from "../context/contexts";

/** Tela de Login e de Cadastro (mode = "login" | "register"). */
const Auth = ({ mode }) => {
  const isRegister = mode === "register";
  const { login, register } = useAuth();
  const location = useLocation();

  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    if (isRegister && form.password !== form.confirm) {
      setErrors({ confirm: "As senhas não conferem." });
      return;
    }

    setSubmitting(true);
    try {
      if (isRegister) {
        await register(form.name, form.email, form.password);
      } else {
        await login(form.email, form.password);
      }
      // O redirecionamento acontece no GuestOnly assim que o usuário fica logado
    } catch (err) {
      setMessage(err.message);
      setErrors(err.fields || {});
      setSubmitting(false);
    }
  };

  const field = (name, label, props) => (
    <div className="form-group">
      <label htmlFor={`auth-${name}`}>{label}</label>
      <input
        id={`auth-${name}`}
        value={form[name]}
        onChange={update(name)}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `auth-${name}-error` : undefined}
        required
        {...props}
      />
      {errors[name] && (
        <p className="form-error" id={`auth-${name}-error`}>
          {errors[name]}
        </p>
      )}
    </div>
  );

  return (
    <div className="auth">
      <div className="auth__card">
        <img src={logo} alt="Logo Amazunfy" className="auth__logo" width="140" height="136" />
        <h1>{isRegister ? "Crie sua conta" : "Entrar no Amazunfy"}</h1>
        <p className="auth__subtitle">O som que te move — a música da nossa cidade.</p>

        <form onSubmit={handleSubmit} noValidate={false}>
          {isRegister && field("name", "Nome", { type: "text", autoComplete: "name", placeholder: "Seu nome" })}
          {field("email", "E-mail", { type: "email", autoComplete: "email", placeholder: "voce@email.com" })}
          {field("password", "Senha", {
            type: "password",
            autoComplete: isRegister ? "new-password" : "current-password",
            placeholder: isRegister ? "Mínimo de 6 caracteres" : "Sua senha",
            minLength: isRegister ? 6 : undefined,
          })}
          {isRegister &&
            field("confirm", "Confirmar senha", { type: "password", autoComplete: "new-password", placeholder: "Repita a senha" })}

          {message && (
            <p className="form-message" role="alert">
              {message}
            </p>
          )}

          <button type="submit" className="btn btn--primary btn--block" disabled={submitting}>
            {submitting ? "Aguarde..." : isRegister ? "Cadastrar" : "Entrar"}
          </button>
        </form>

        <p className="auth__switch">
          {isRegister ? (
            <>
              Já tem uma conta? <Link to="/login" state={location.state}>Entrar</Link>
            </>
          ) : (
            <>
              Não tem uma conta? <Link to="/register" state={location.state}>Registre-se</Link>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default Auth;
