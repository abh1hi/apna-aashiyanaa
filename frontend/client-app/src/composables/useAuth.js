
import { ref } from 'vue';

const token = ref(localStorage.getItem('token') || null);

export function useAuth() {
    const setToken = (newToken) => {
        token.value = newToken;
        localStorage.setItem('token', newToken);
    };

    const removeToken = () => {
        token.value = null;
        localStorage.removeItem('token');
    };

    return {
        token,
        setToken,
        removeToken,
    };
}
