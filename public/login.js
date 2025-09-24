class LoginForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.emailInput = this.form.querySelector('#email-input');
        this.passwordInput = this.form.querySelector('#password-input');
        this.togglePassword = this.form.querySelector('#toggle-password');
        this.submitButton = this.form.querySelector('input[type="submit"]');
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.#handleSubmit(e));
        if (this.togglePassword) {
            this.togglePassword.addEventListener('click', () => this.#togglePasswordVisibility());
        }

        // Adiciona validação em tempo real (on-blur)
        this.emailInput.addEventListener('blur', () => this.#validateEmailField());
        this.passwordInput.addEventListener('blur', () => this.#validatePasswordField());
    }

    #togglePasswordVisibility() {
        const type = this.passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        this.passwordInput.setAttribute('type', type);
        this.togglePassword.classList.toggle('fa-eye');
        this.togglePassword.classList.toggle('fa-eye-slash');
    }

    #validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    #setError(input, message) {
        const inputContainer = input.parentElement;
        const errorMessage = inputContainer.querySelector('.error-message');
        errorMessage.innerText = message;
        inputContainer.classList.add('error');
    }

    #clearError(input) {
        const inputContainer = input.parentElement;
        inputContainer.classList.remove('error');
    }

    #validateEmailField() {
        this.#clearError(this.emailInput);
        const emailValue = this.emailInput.value.trim();

        if (emailValue === '') {
            this.#setError(this.emailInput, 'O campo de e-mail é obrigatório.');
            return false;
        } else if (!this.#validateEmail(emailValue)) {
            this.#setError(this.emailInput, 'Por favor, insira um e-mail válido.');
            return false;
        }
        return true;
    }

    #validatePasswordField() {
        this.#clearError(this.passwordInput);
        const passwordValue = this.passwordInput.value.trim();

        if (passwordValue === '') {
            this.#setError(this.passwordInput, 'O campo de senha é obrigatório.');
            return false;
        }
        return true;
    }

    async #handleSubmit(e) {
        e.preventDefault();
        
        const isEmailValid = this.#validateEmailField();
        const isPasswordValid = this.#validatePasswordField();

        if (!isEmailValid || !isPasswordValid) {
            return;
        }

        this.submitButton.disabled = true;
        this.submitButton.classList.add('loading');

        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                showToast(result.message, 'success');
                // Redireciona para o dashboard após um pequeno atraso para o usuário ver o toast.
                setTimeout(() => {
                    window.location.href = result.redirect;
                }, 1500);
            } else {
                showToast(result.message || 'Ocorreu um erro.', 'error');
                this.submitButton.disabled = false;
                this.submitButton.classList.remove('loading');
            }
        } catch (error) {
            console.error('Erro ao tentar fazer login:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('loading');
        }
    }
}

class RegistrationForm {
    constructor(formId) {
        this.form = document.getElementById(formId);
        if (!this.form) return;

        this.nameInput = this.form.querySelector('#register-name');
        this.emailInput = this.form.querySelector('#register-email');
        this.passwordInput = this.form.querySelector('#register-password');
        this.termsInput = this.form.querySelector('#terms-consent');
        this.submitButton = this.form.querySelector('input[type="submit"]');

        this.strengthMeter = document.getElementById('strength-meter');
        this.strengthBar = this.strengthMeter?.querySelector('.strength-bar');
        this.strengthText = this.strengthMeter?.querySelector('.strength-text');
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.#handleSubmit(e));
        this.passwordInput.addEventListener('input', () => this.#checkPasswordStrength());

        // Validação em tempo real
        this.nameInput.addEventListener('blur', () => this.#validateNameField());
        this.emailInput.addEventListener('blur', () => this.#validateEmailField());
        this.passwordInput.addEventListener('blur', () => this.#validatePasswordField());
        this.termsInput.addEventListener('change', () => this.#validateTermsField());
    }

    #validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    #setError(input, message) {
        const inputContainer = input.parentElement;
        const errorMessage = inputContainer.querySelector('.error-message');
        errorMessage.innerText = message;
        inputContainer.classList.add('error');
    }

    #clearError(input) {
        const inputContainer = input.parentElement;
        inputContainer.classList.remove('error');
    }

    #validateNameField() {
        this.#clearError(this.nameInput);
        if (this.nameInput.value.trim() === '') {
            this.#setError(this.nameInput, 'O campo de nome é obrigatório.');
            return false;
        }
        return true;
    }

    #validateEmailField() {
        this.#clearError(this.emailInput);
        const emailValue = this.emailInput.value.trim();
        if (emailValue === '') {
            this.#setError(this.emailInput, 'O campo de e-mail é obrigatório.');
            return false;
        } else if (!this.#validateEmail(emailValue)) {
            this.#setError(this.emailInput, 'Por favor, insira um e-mail válido.');
            return false;
        }
        return true;
    }

    #validatePasswordField() {
        this.#clearError(this.passwordInput);
        const passwordValue = this.passwordInput.value;
        if (passwordValue === '') {
            this.#setError(this.passwordInput, 'O campo de senha é obrigatório.');
            return false;
        } else if (passwordValue.length < 8) {
            this.#setError(this.passwordInput, 'A senha deve ter no mínimo 8 caracteres.');
            return false;
        }
        return true;
    }

    #validateTermsField() {
        this.#clearError(this.termsInput);
        if (!this.termsInput.checked) {
            this.#setError(this.termsInput, 'Você deve aceitar os termos para continuar.');
            return false;
        }
        return true;
    }

    async #handleSubmit(e) {
        e.preventDefault();
        const isNameValid = this.#validateNameField();
        const isEmailValid = this.#validateEmailField();
        const isPasswordValid = this.#validatePasswordField();
        const areTermsValid = this.#validateTermsField();

        if (!(isNameValid && isEmailValid && isPasswordValid && areTermsValid)) {
            return;
        }

        this.submitButton.disabled = true;
        this.submitButton.classList.add('loading');

        try {
            const formData = new FormData(this.form);
            const response = await fetch(this.form.action, {
                method: 'POST',
                body: formData
            });

            const result = await response.json();

            if (result.status === 'success') {
                showToast(result.message, 'success');
                // Fecha o modal e limpa o formulário após o sucesso
                document.getElementById('close-modal-btn').click();
                this.form.reset();
            } else {
                showToast(result.message || 'Ocorreu um erro.', 'error');
                this.submitButton.disabled = false;
                this.submitButton.classList.remove('loading');
            }

        } catch (error) {
            console.error('Erro ao submeter o formulário:', error);
            showToast('Não foi possível conectar ao servidor.', 'error');
            this.submitButton.disabled = false;
            this.submitButton.classList.remove('loading');
        }
    }

    #checkPasswordStrength() {
        const password = this.passwordInput.value;
        let score = 0;
        let text = ''; 
        let strengthClass = ''; 

        if (password.length === 0) {
            this.strengthMeter.style.display = 'none';
            return;
        }

        this.strengthMeter.style.display = 'block';

        // Critérios de pontuação
        if (password.length >= 8) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        switch (score) {
            case 1:
            case 2:
                text = 'Fraca';
                strengthClass = 'weak';
                break;
            case 3:
                text = 'Média';
                strengthClass = 'medium';
                break;
            case 4:
                text = 'Forte';
                strengthClass = 'strong';
                break;
            default:
                text = 'Muito Fraca';
                strengthClass = 'weak';
                break;
        }

        this.strengthMeter.className = 'password-strength-meter ' + strengthClass;
        this.strengthText.textContent = `Força da senha: ${text}`;
    }
}

class ThemeManager {
    constructor(toggleButtonId) {
        this.toggleButton = document.getElementById(toggleButtonId);
        this.currentTheme = localStorage.getItem('theme');
    }

    init() {
        if (this.currentTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else if (!this.currentTheme && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            // Se não houver preferência salva, usa a do sistema
            document.body.classList.add('dark-mode');
        }

        this.toggleButton.addEventListener('click', () => this.#toggleTheme());
    }

    #toggleTheme() {
        document.body.classList.toggle('dark-mode');
        let theme = 'light';
        if (document.body.classList.contains('dark-mode')) {
            theme = 'dark';
        }
        localStorage.setItem('theme', theme);
    }
}

// --- Função Utilitária para Toasts ---
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const iconClass = type === 'success' ? 'fa-solid fa-check-circle' : 'fa-solid fa-exclamation-circle';
    toast.innerHTML = `<i class="${iconClass}"></i> ${message}`;

    container.appendChild(toast);

    // Remove o toast do DOM após a animação de fadeOut terminar
    setTimeout(() => {
        toast.remove();
    }, 5000); // 5 segundos (4.5s de espera + 0.5s de animação)
}


document.addEventListener('DOMContentLoaded', () => {
    const loginForm = new LoginForm('login-form');
    loginForm.init();

    const registrationForm = new RegistrationForm('register-form');
    registrationForm.init();

    const themeManager = new ThemeManager('theme-toggle');
    themeManager.init();

    // Lógica do Modal
    const openModalLink = document.getElementById('open-modal-link');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalOverlay = document.getElementById('registration-modal');

    if (openModalLink && closeModalBtn && modalOverlay) {
        openModalLink.addEventListener('click', (e) => {
            e.preventDefault();
            document.body.classList.add('modal-open');
            modalOverlay.classList.add('active');
        });

        const closeModal = () => {
            document.body.classList.remove('modal-open');
            modalOverlay.classList.remove('active');
        };

        closeModalBtn.addEventListener('click', closeModal);
        modalOverlay.addEventListener('click', (e) => {
            // Fecha o modal apenas se o clique for no overlay (fundo)
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
});